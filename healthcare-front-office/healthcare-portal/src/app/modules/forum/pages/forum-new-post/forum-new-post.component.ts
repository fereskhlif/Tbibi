import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { CategoryResponse } from '../../models/forum.models';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-forum-new-post',
  templateUrl: './forum-new-post.component.html'
})
export class ForumNewPostComponent implements OnInit {
  @ViewChild('mediaFileInput') mediaFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('contentInput') contentInput?: ElementRef<HTMLTextAreaElement>;

  categories: CategoryResponse[] = [];
  loadingCategories = true;

  selectedCategoryId: number | null = null;
  title = '';
  content = '';
  submitting = false;
  formError = '';

  activeTab: 'text' | 'image' | 'link' = 'text';

  currentUserId = 1;

  selectedFiles: File[] = [];
  filePreviews: string[] = [];

  constructor(private forumService: ForumService, private router: Router, private route: ActivatedRoute) { }

  insertMarkdown(prefix: string, suffix: string, textareaElement?: HTMLTextAreaElement): void {
    // Prefer passed element, fallback to ViewChild, fallback to querySelector
    const textarea = textareaElement || (this.contentInput ? this.contentInput.nativeElement : document.querySelector('textarea'));
    if (!textarea) return;
    
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const text = this.content || '';

    const selectedText = text.substring(start, end);
    const replacement = prefix + selectedText + suffix;

    this.content = text.substring(0, start) + replacement + text.substring(end);

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
    if (this.content && confirm('Are you sure you want to clear the text?')) {
      this.content = '';
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
    if (!this.selectedCategoryId) {
      this.formError = 'Please select a category.';
      return;
    }
    if (!this.title.trim()) {
      this.formError = 'Please enter a title.';
      return;
    }
    if (!this.content.trim() && this.selectedFiles.length === 0) {
      this.formError = 'Please enter post content or upload media.';
      return;
    }

    this.submitting = true;
    this.forumService.createPost({
      title: this.title.trim(),
      content: this.content.trim(),
      categoryId: this.selectedCategoryId,
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

  goBack(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}