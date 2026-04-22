import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { CategoryResponse } from '../../models/forum.models';
import { ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';  // ✅ ADDED

export function meaningfulTextValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const trimmed = value.trim();
  if (trimmed.length === 0) return { 'whitespace': true };
  const lettersMatch = value.match(/[a-zA-ZÀ-ÿ]/g);
  if (!lettersMatch || lettersMatch.length < 4) return { 'meaningless': true };
  if (/(.)\1{3,}/.test(value)) return { 'spam': true };
  const words = trimmed.split(/\s+/);
  const hasExtremelyLongWord = words.some((word: string) =>
    word.length > 20 && !word.startsWith('http')
  );
  if (hasExtremelyLongWord) return { 'gibberish': true };
  if (/[bcdfghjklmnpqrstvwxzBCDFGHJKLMNPQRSTVWXZ]{6,}/.test(value)) return { 'smash': true };
  if (/[0-9]{7,}/.test(value)) return { 'spam': true };
  return null;
}

@Component({
  selector: 'app-forum-new-post',
  templateUrl: './forum-new-post.component.html'
})
export class ForumNewPostComponent implements OnInit {
  @ViewChild('mediaFileInput') mediaFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('contentInput') contentInput?: ElementRef<HTMLTextAreaElement>;

  categories: CategoryResponse[] = [];
  loadingCategories = true;

  postForm!: FormGroup;
  submitting = false;
  formError = '';
  activeTab: 'text' | 'image' | 'link' = 'text';
  currentUserId = 1;

  selectedFiles: File[] = [];
  filePreviews: string[] = [];

  // ✅ ADDED — AI warning state
  toxicWarning = false;
  warningMessage = '';
  private checkTimeout: any;

  constructor(
    private forumService: ForumService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient   // ✅ ADDED
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.postForm = this.fb.group({
      categoryId: [null, Validators.required],
      title: ['', [Validators.required, meaningfulTextValidator, Validators.minLength(5), Validators.maxLength(200)]],
      content: ['', [Validators.required, meaningfulTextValidator, Validators.minLength(10)]]
    });
  }

  // ✅ ADDED — calls your real AI model, not a word list
  checkContentRealTime(): void {
    clearTimeout(this.checkTimeout);

    const title = this.postForm.get('title')?.value || '';
    const content = this.postForm.get('content')?.value || '';
    const textToCheck = `${title} ${content}`.trim();

    if (!textToCheck) {
      this.toxicWarning = false;
      return;
    }

    // Wait 600ms after user stops typing → then call AI
    this.checkTimeout = setTimeout(() => {
      this.http.post<any>('http://localhost:8000/sanitize', { text: textToCheck })
        .subscribe({
          next: (result) => {
            if (result.is_toxic) {
              this.toxicWarning = true;
              this.warningMessage = '⚠️ Your post contains language that will be automatically filtered by our AI moderation system before publishing.';
            } else {
              this.toxicWarning = false;
              this.warningMessage = '';
            }
          },
          error: () => {
            // AI service down → show nothing, don't break UX
            this.toxicWarning = false;
          }
        });
    }, 600);
  }

  insertMarkdown(prefix: string, suffix: string, textareaElement?: HTMLTextAreaElement): void {
    const textarea = textareaElement || (this.contentInput ? this.contentInput.nativeElement : document.querySelector('textarea'));
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const text = this.postForm.get('content')?.value || '';
    const selectedText = text.substring(start, end);
    const replacement = prefix + selectedText + suffix;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    this.postForm.get('content')?.setValue(newValue);
    setTimeout(() => {
      textarea.focus();
      if (selectedText.length === 0) {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      } else {
        textarea.setSelectionRange(start, start + replacement.length);
      }
    });
  }

  clearContent(): void {
    if (this.postForm.get('content')?.value && confirm('Are you sure you want to clear the text?')) {
      this.postForm.get('content')?.setValue('');
      this.toxicWarning = false;  // ✅ clear warning when content cleared
    }
  }

  openFilePicker(): void {
    this.mediaFileInput.nativeElement.click();
  }

  ngOnInit(): void {
    this.forumService.getCategories().subscribe({
      next: (data) => {
        this.categories = data.filter(c => c.active);
        this.loadingCategories = false;
      },
      error: () => this.loadingCategories = false
    });
  }

  onFilesChanged(files: FileList | null): void {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files);
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => this.filePreviews.push(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.filePreviews.splice(index, 1);
  }

  submit(): void {
    this.formError = '';
    this.postForm.markAllAsTouched();

    if (this.postForm.invalid) {
      this.formError = 'Please correct the errors in the form.';
      return;
    }

    const { title, content, categoryId } = this.postForm.value;
    this.submitting = true;

    this.forumService.createPost({
      title: title.trim(),
      content: content.trim(),
      categoryId: categoryId,
      authorId: this.currentUserId
    }).subscribe({
      next: (post) => {
        // ✅ Check if AI cleaned anything
        const wasCleaned = post.title !== title.trim() ||
          post.content !== content.trim();

        if (this.selectedFiles.length > 0) {
          this.forumService.uploadPostMedia(post.postId, this.selectedFiles).subscribe({
            next: () => {
              this.submitting = false;
              this.router.navigate(['../post', post.postId], {
                relativeTo: this.route,
                state: { wasCleaned }
              });
            },
            error: () => {
              this.submitting = false;
              this.router.navigate(['../post', post.postId], {
                relativeTo: this.route,
                state: { wasCleaned }
              });
            }
          });
        } else {
          this.submitting = false;
          this.router.navigate(['../post', post.postId], {
            relativeTo: this.route,
            state: { wasCleaned }
          });
        }
      },
      error: () => {
        this.formError = 'Failed to create post. Please try again.';
        this.submitting = false;
      }
    });
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.postForm.get(controlName);
    return !!(control && control.hasError(errorName) && control.touched);
  }

  isInvalid(controlName: string): boolean {
    const control = this.postForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}