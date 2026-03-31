import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { CategoryResponse } from '../../models/forum.models';
import { ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(
    private forumService: ForumService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.postForm = this.fb.group({
      categoryId: [null, Validators.required],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  insertMarkdown(prefix: string, suffix: string, textareaElement?: HTMLTextAreaElement): void {
    // Prefer passed element, fallback to ViewChild, fallback to querySelector
    const textarea = textareaElement || (this.contentInput ? this.contentInput.nativeElement : document.querySelector('textarea'));
    if (!textarea) return;
    
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const text = this.postForm.get('content')?.value || '';

    const selectedText = text.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    this.postForm.get('content')?.setValue(newValue);

    // Ensure we run the exact selection update after Angular syncs ngModel to DOM
    setTimeout(() => {
      textarea.focus();
      if (selectedText.length === 0) {
        // Place cursor between prefix and suffix
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      } else {
        // Highlight the newly wrapped text
        textarea.setSelectionRange(start, start + replacement.length);
      }
    });
  }

  clearContent(): void {
    if (this.postForm.get('content')?.value && confirm('Are you sure you want to clear the text?')) {
      this.postForm.get('content')?.setValue('');
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
        if (this.selectedFiles.length > 0) {
          this.forumService.uploadPostMedia(post.postId, this.selectedFiles).subscribe({
            next: () => {
              this.submitting = false;
              this.router.navigate(['../post', post.postId], { relativeTo: this.route });
            },
            error: () => {
              this.submitting = false;
              this.router.navigate(['../post', post.postId], { relativeTo: this.route });
            }
          });
        } else {
          this.submitting = false;
          this.router.navigate(['../post', post.postId], { relativeTo: this.route });
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