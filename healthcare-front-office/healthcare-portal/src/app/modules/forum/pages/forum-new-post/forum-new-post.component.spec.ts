
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ForumNewPostComponent } from './forum-new-post.component';
import { ForumService } from '../../services/forum.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, delay, asyncScheduler } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform, Directive, Input, Output, EventEmitter } from '@angular/core';
import { CategoryResponse, PostResponse } from '../../models/forum.models';

@Pipe({ name: 'markdown' })
class MockMarkdownPipe implements PipeTransform {
    transform(value: string): string { return value; }
}

@Directive({
    selector: '[appFilePicker]',
    exportAs: 'appFilePicker'
})
class StubFilePickerDirective {
    @Input() multiple: boolean = false;
    @Output() filesChanged = new EventEmitter<FileList>();
    trigger(): void { }
}

describe('ForumNewPostComponent', () => {
    let component: ForumNewPostComponent;
    let fixture: ComponentFixture<ForumNewPostComponent>;
    let forumServiceSpy: jasmine.SpyObj<ForumService>;
    let routerSpy: jasmine.SpyObj<Router>;

    const mockCategories: CategoryResponse[] = [
        {
            categoryId: 1,
            categoryName: 'Ask a Doctor',
            categoryDescription: 'Medical questions',
            createdAt: '2024-01-01',
            active: true,
            postCount: 10
        },
        {
            categoryId: 2,
            categoryName: 'General Health',
            categoryDescription: 'General discussions',
            createdAt: '2024-01-02',
            active: true,
            postCount: 5
        },
        {
            categoryId: 3,
            categoryName: 'Inactive',
            categoryDescription: 'Inactive category',
            createdAt: '2024-01-03',
            active: false,
            postCount: 0
        }
    ];

    const mockCreatedPost: PostResponse = {
        postId: 1,
        title: 'New Post Title',
        content: 'New post content',
        createdDate: '2024-01-15T10:00:00',
        updatedDate: '2024-01-15T10:00:00',
        views: 0,
        postStatus: 'OPEN',
        isPinned: false,
        isDeleted: false,
        authorId: 1,
        authorName: 'Test User',
        categoryId: 1,
        categoryName: 'Ask a Doctor',
        commentCount: 0,
        voteCount: 0,
        mediaUrls: []
    };

    let mockActivatedRoute: any;

    beforeEach(async () => {
        forumServiceSpy = jasmine.createSpyObj('ForumService', [
            'getCategories',
            'createPost',
            'uploadPostMedia'
        ]);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        mockActivatedRoute = {
            snapshot: {
                data: {}
            }
        };

        forumServiceSpy.getCategories.and.returnValue(of(mockCategories));
        forumServiceSpy.createPost.and.returnValue(of(mockCreatedPost, asyncScheduler));
        forumServiceSpy.uploadPostMedia.and.returnValue(of(mockCreatedPost, asyncScheduler));

        await TestBed.configureTestingModule({
            declarations: [ForumNewPostComponent, MockMarkdownPipe, StubFilePickerDirective],
            imports: [FormsModule, ReactiveFormsModule],
            providers: [
                { provide: ForumService, useValue: forumServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ForumNewPostComponent);
        component = fixture.componentInstance;
    });

    afterEach(fakeAsync(() => {
        flush();
    }));

    // ══════════════════════════════════════════════════════════════════
    // COMPONENT CREATION
    // ══════════════════════════════════════════════════════════════════

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // ══════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ══════════════════════════════════════════════════════════════════

    describe('Initialization', () => {

        it('should load categories on init', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            expect(forumServiceSpy.getCategories).toHaveBeenCalled();
            expect(component.categories.length).toBe(2); // Only active
            expect(component.loadingCategories).toBe(false);
        }));

        it('should filter out inactive categories', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            const inactiveCategory = component.categories.find(c => c.categoryName === 'Inactive');
            expect(inactiveCategory).toBeUndefined();
        }));

        it('should handle category loading error', fakeAsync(() => {
            forumServiceSpy.getCategories.and.returnValue(throwError(() => new Error('Failed')));

            fixture.detectChanges();
            tick();

            expect(component.loadingCategories).toBe(false);
        }));

        it('should start with text tab active', () => {
            expect(component.activeTab).toBe('text');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // TAB SWITCHING
    // ══════════════════════════════════════════════════════════════════

    describe('Tab Switching', () => {

        it('should switch to image tab', () => {
            component.activeTab = 'image';
            expect(component.activeTab).toBe('image');
        });

        it('should switch to link tab', () => {
            component.activeTab = 'link';
            expect(component.activeTab).toBe('link');
        });

        it('should switch back to text tab', () => {
            component.activeTab = 'image';
            component.activeTab = 'text';
            expect(component.activeTab).toBe('text');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // FORM VALIDATION
    // ══════════════════════════════════════════════════════════════════

    describe('Form Validation', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            flush();
        }));

        it('should show error when category not selected', () => {
            component.postForm.patchValue({
                categoryId: null,
                title: 'Test Title',
                content: 'Test content'
            });

            component.submit();

            expect(component.formError).toBe('Please correct the errors in the form.');
            expect(forumServiceSpy.createPost).not.toHaveBeenCalled();
        });

        it('should show error when title is empty', () => {
            component.postForm.patchValue({
                categoryId: 1,
                title: '',
                content: 'Test content'
            });

            component.submit();

            expect(component.formError).toBe('Please correct the errors in the form.');
        });

        it('should show error when title is too short', () => {
            component.postForm.patchValue({
                categoryId: 1,
                title: 'Abc',
                content: 'Test content'
            });

            component.submit();

            expect(component.formError).toBe('Please correct the errors in the form.');
        });

        it('should show error when title is only whitespace', () => {
            component.postForm.patchValue({
                categoryId: 1,
                title: '   ',
                content: 'Test content'
            });

            component.submit();

            expect(component.formError).toBe('Please correct the errors in the form.');
        });

        it('should show error when content is empty and no files', () => {
            component.postForm.patchValue({
                categoryId: 1,
                title: 'Test Title',
                content: ''
            });
            component.selectedFiles = [];

            component.submit();

            expect(component.formError).toBe('Please correct the errors in the form.');
        });

        it('should not allow submission with files but no content (due to Validators.required)', () => {
            component.postForm.patchValue({
                categoryId: 1,
                title: 'Test Title',
                content: ''
            });
            component.selectedFiles = [new File([''], 'test.jpg')];

            component.submit();

            // Error because Validators.required is on content
            expect(component.formError).toBe('Please correct the errors in the form.');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // SUBMIT POST
    // ══════════════════════════════════════════════════════════════════

    describe('Submit Post', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            tick();
        }));

        it('should create post without media', fakeAsync(() => {
            component.postForm.patchValue({
                categoryId: 1,
                title: 'Test Title',
                content: 'Test content that is long enough'
            });
            component.selectedFiles = [];

            component.submit();
            tick();

            expect(forumServiceSpy.createPost).toHaveBeenCalledWith({
                title: 'Test Title',
                content: 'Test content that is long enough',
                categoryId: 1,
                authorId: 1
            });
            expect(forumServiceSpy.uploadPostMedia).not.toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalled();
        }));

        it('should create post with media', fakeAsync(() => {
            component.postForm.patchValue({
                categoryId: 1,
                title: 'Test Title',
                content: 'Test content that is long enough'
            });
            component.selectedFiles = [new File([''], 'test.jpg')];

            component.submit();
            tick();

            expect(forumServiceSpy.createPost).toHaveBeenCalled();
            expect(forumServiceSpy.uploadPostMedia).toHaveBeenCalledWith(1, component.selectedFiles);
        }));

        it('should show submitting state', fakeAsync(() => {
            component.postForm.patchValue({
                categoryId: 1,
                title: 'Test Title',
                content: 'Test content that is long enough'
            });

            expect(component.submitting).toBe(false);

            component.submit();

            expect(component.submitting).toBe(true);

            tick();

            expect(component.submitting).toBe(false);
        }));

        it('should handle post creation error', fakeAsync(() => {
            forumServiceSpy.createPost.and.returnValue(throwError(() => new Error('Failed')));

            component.postForm.patchValue({
                categoryId: 1,
                title: 'Test Title',
                content: 'Test content that is long enough'
            });

            component.submit();
            tick();

            expect(component.formError).toBe('Failed to create post. Please try again.');
            expect(component.submitting).toBe(false);
        }));

        it('should navigate after successful post creation', fakeAsync(() => {
            component.postForm.patchValue({
                categoryId: 1,
                title: 'Test Title',
                content: 'Test content that is long enough'
            });

            component.submit();
            tick();

            expect(routerSpy.navigate).toHaveBeenCalledWith(
                ['../post', 1],
                { relativeTo: mockActivatedRoute as any }
            );
        }));
    });

    // ══════════════════════════════════════════════════════════════════
    // FILE HANDLING
    // ══════════════════════════════════════════════════════════════════

    describe('File Handling', () => {

        it('should add files when selected', () => {
            const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            const fileList = {
                0: mockFile,
                length: 1,
                item: () => mockFile
            } as FileList;

            component.onFilesChanged(fileList);

            expect(component.selectedFiles.length).toBe(1);
            expect(component.selectedFiles[0].name).toBe('test.jpg');
        });

        it('should append multiple files', () => {
            const file1 = new File([''], 'test1.jpg');
            const file2 = new File([''], 'test2.jpg');

            component.onFilesChanged({ 0: file1, length: 1, item: () => file1 } as FileList);
            component.onFilesChanged({ 0: file2, length: 1, item: () => file2 } as FileList);

            expect(component.selectedFiles.length).toBe(2);
        });

        it('should remove file at specific index', () => {
            component.selectedFiles = [
                new File([''], 'file1.jpg'),
                new File([''], 'file2.jpg'),
                new File([''], 'file3.jpg')
            ];
            component.filePreviews = ['preview1', 'preview2', 'preview3'];

            component.removeFile(1);

            expect(component.selectedFiles.length).toBe(2);
            expect(component.selectedFiles[0].name).toBe('file1.jpg');
            expect(component.selectedFiles[1].name).toBe('file3.jpg');
        });

        it('should handle null file list', () => {
            component.onFilesChanged(null);
            expect(component.selectedFiles.length).toBe(0);
        });

        it('should handle empty file list', () => {
            component.onFilesChanged({ length: 0 } as FileList);
            expect(component.selectedFiles.length).toBe(0);
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // MARKDOWN TOOLBAR
    // ══════════════════════════════════════════════════════════════════

    describe('Markdown Toolbar', () => {

        it('should insert bold markdown around selection', () => {
            const textarea = document.createElement('textarea');
            textarea.value = 'Hello World';
            textarea.selectionStart = 0;
            textarea.selectionEnd = 5;

            component.postForm.get('content')?.setValue('Hello World');
            component.insertMarkdown('**', '**', textarea);

            expect(component.postForm.get('content')?.value).toContain('**Hello**');
        });

        it('should insert code block', () => {
            const textarea = document.createElement('textarea');
            textarea.value = 'code';
            textarea.selectionStart = 0;
            textarea.selectionEnd = 4;

            component.postForm.get('content')?.setValue('code');
            component.insertMarkdown('\n```\n', '\n```\n', textarea);

            expect(component.postForm.get('content')?.value).toContain('```');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // CLEAR CONTENT
    // ══════════════════════════════════════════════════════════════════

    describe('Clear Content', () => {

        it('should clear content when confirmed', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            component.postForm.get('content')?.setValue('Some content');

            component.clearContent();

            expect(component.postForm.get('content')?.value).toBe('');
        });

        it('should not clear when cancelled', () => {
            spyOn(window, 'confirm').and.returnValue(false);
            component.postForm.get('content')?.setValue('Some content');

            component.clearContent();

            expect(component.postForm.get('content')?.value).toBe('Some content');
        });

        it('should not prompt when content is empty', () => {
            const confirmSpy = spyOn(window, 'confirm');
            component.postForm.get('content')?.setValue('');

            component.clearContent();

            expect(confirmSpy).not.toHaveBeenCalled();
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // NAVIGATION
    // ══════════════════════════════════════════════════════════════════

    describe('Navigation', () => {

        it('should navigate back', () => {
            component.goBack();

            expect(routerSpy.navigate).toHaveBeenCalledWith(
                ['..'],
                { relativeTo: mockActivatedRoute as any }
            );
        });
    });
});