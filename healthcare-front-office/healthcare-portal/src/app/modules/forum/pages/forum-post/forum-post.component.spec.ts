// src/app/modules/forum/pages/forum-post/forum-post.component.spec.ts

import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ForumPostComponent } from './forum-post.component';
import { ForumService } from '../../services/forum.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform, Directive, Input, Output, EventEmitter } from '@angular/core';
import { PostResponse, CommentResponse } from '../../models/forum.models';

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

describe('ForumPostComponent', () => {
    let component: ForumPostComponent;
    let fixture: ComponentFixture<ForumPostComponent>;
    let forumServiceSpy: jasmine.SpyObj<ForumService>;
    let routerSpy: jasmine.SpyObj<Router>;

    // ══════════════════════════════════════════════════════════════════
    // MOCK DATA
    // ══════════════════════════════════════════════════════════════════

    const mockPost: PostResponse = {
        postId: 1,
        title: 'How to manage diabetes?',
        content: 'Looking for advice on managing diabetes',
        createdDate: '2024-01-15T10:00:00',
        updatedDate: '2024-01-15T10:00:00',
        views: 100,
        postStatus: 'OPEN',
        isPinned: false,
        isDeleted: false,
        authorId: 1,
        authorName: 'John Doe',
        categoryId: 1,
        categoryName: 'Ask a Doctor',
        commentCount: 2,
        voteCount: 10,
        mediaUrls: ['']
    };

    const mockComments: CommentResponse[] = [
        {
            commentId: 1,
            comment: 'Great question!',
            commentDate: '2024-01-15T12:00:00',
            updatedDate: '2024-01-15T12:00:00',
            isDeleted: false,
            authorId: 2,
            authorName: 'Dr. Smith',
            postId: 1,
            parentCommentId: null,
            isPinned: false,
            voteCount: 0,
            userHasVoted: false,
            replies: []
        },
        {
            commentId: 2,
            comment: 'I recommend consulting a specialist.',
            commentDate: '2024-01-15T13:00:00',
            updatedDate: '2024-01-15T13:00:00',
            isDeleted: false,
            authorId: 3,
            authorName: 'Dr. Johnson',
            postId: 1,
            parentCommentId: null,
            isPinned: false,
            voteCount: 0,
            userHasVoted: false,
            replies: [
                {
                    commentId: 3,
                    comment: 'Thank you!',
                    commentDate: '2024-01-15T14:00:00',
                    updatedDate: '2024-01-15T14:00:00',
                    isDeleted: false,
                    authorId: 1,
                    authorName: 'John Doe',
                    postId: 1,
                    parentCommentId: 2,
                    isPinned: false,
                    voteCount: 0,
                    userHasVoted: false,
                    replies: []
                }
            ]
        }
    ];

    let mockActivatedRoute: any;

    // ══════════════════════════════════════════════════════════════════
    // SETUP
    // ══════════════════════════════════════════════════════════════════

    beforeEach(async () => {
        forumServiceSpy = jasmine.createSpyObj('ForumService', [
            'getPostById',
            'getCommentsByPost',
            'checkVote',
            'vote',
            'unvote',
            'createComment',
            'updatePostStatus',
            'getUserVotedComments'
        ]);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        mockActivatedRoute = {
            snapshot: {
                paramMap: {
                    get: (key: string) => key === 'id' ? '1' : null
                },
                data: {
                    role: 'DOCTOR',
                    userId: 2,
                    userName: 'Dr. Smith'
                }
            },
            parent: {
                snapshot: {
                    data: {}
                }
            }
        };

        forumServiceSpy.getPostById.and.returnValue(of(mockPost));
        forumServiceSpy.getCommentsByPost.and.returnValue(of(mockComments));
        forumServiceSpy.getUserVotedComments.and.returnValue(of([]));
        forumServiceSpy.checkVote.and.returnValue(of(false));
        forumServiceSpy.vote.and.returnValue(of({ voteId: 1, userId: 2, userName: 'Dr. Smith', postId: 1, createdAt: '' }));
        forumServiceSpy.unvote.and.returnValue(of(void 0));
        forumServiceSpy.createComment.and.returnValue(of(mockComments[0]));
        forumServiceSpy.updatePostStatus.and.returnValue(of({ ...mockPost, postStatus: 'RESOLVED' }));

        // Mock clipboard API
        spyOnProperty(navigator, 'clipboard', 'get').and.returnValue({
            writeText: () => Promise.resolve(),
        } as any);

        await TestBed.configureTestingModule({
            declarations: [ForumPostComponent, MockMarkdownPipe, StubFilePickerDirective],
            imports: [FormsModule],
            providers: [
                { provide: ForumService, useValue: forumServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ForumPostComponent);
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
    // INITIALIZATION TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Initialization', () => {

        it('should load post on init', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            expect(forumServiceSpy.getPostById).toHaveBeenCalledWith(1);
            expect(component.post).toEqual(mockPost);
            expect(component.loading).toBe(false);
        }));

        it('should load comments after post loads', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            expect(forumServiceSpy.getCommentsByPost).toHaveBeenCalledWith(1);
            expect(component.comments.length).toBe(2);
        }));

        it('should check if user has voted', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            expect(forumServiceSpy.checkVote).toHaveBeenCalledWith(2, 1);
        }));

        it('should set vote count from post', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            expect(component.voteCount).toBe(10);
        }));

        it('should handle post loading error', fakeAsync(() => {
            forumServiceSpy.getPostById.and.returnValue(throwError(() => new Error('Failed')));

            fixture.detectChanges();
            tick();

            expect(component.error).toBe('Failed to load this post.');
            expect(component.loading).toBe(false);
        }));

        it('should set role badge for doctor', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            expect(component.roleBadge).toBe('🩺 Doctor');
        }));
    });

    // ══════════════════════════════════════════════════════════════════
    // VOTING TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Voting', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            tick();
        }));

        it('should add vote when not voted', fakeAsync(() => {
            component.hasVoted = false;
            component.voteCount = 10;

            component.toggleVote();
            tick();

            expect(forumServiceSpy.vote).toHaveBeenCalled();
            expect(component.hasVoted).toBe(true);
            expect(component.voteCount).toBe(11);
        }));

        it('should remove vote when already voted', fakeAsync(() => {
            component.hasVoted = true;
            component.voteCount = 10;

            component.toggleVote();
            tick();

            expect(forumServiceSpy.unvote).toHaveBeenCalled();
            expect(component.hasVoted).toBe(false);
            expect(component.voteCount).toBe(9);
        }));
    });

    // ══════════════════════════════════════════════════════════════════
    // COMMENT TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Comments', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            tick();
        }));

        it('should submit a new comment', fakeAsync(() => {
            component.newComment = 'This is a test comment';

            component.submitComment();
            tick();

            expect(forumServiceSpy.createComment).toHaveBeenCalledWith({
                comment: 'This is a test comment',
                authorId: 2,
                postId: 1,
                parentCommentId: null
            });
            expect(component.newComment).toBe('');
            expect(component.submittingComment).toBe(false);
        }));

        it('should not submit empty comment', () => {
            component.newComment = '   ';

            component.submitComment();

            expect(forumServiceSpy.createComment).not.toHaveBeenCalled();
        });

        it('should start reply to a comment', () => {
            component.startReply(1);

            expect(component.replyingTo).toBe(1);
            expect(component.replyText).toBe('');
        });

        it('should toggle reply off when clicking same comment', () => {
            component.replyingTo = 1;

            component.startReply(1);

            expect(component.replyingTo).toBeNull();
        });

        it('should submit reply to a comment', fakeAsync(() => {
            component.replyText = 'This is a reply';
            component.replyingTo = 1;

            component.submitReply(1);
            tick();

            expect(forumServiceSpy.createComment).toHaveBeenCalledWith({
                comment: 'This is a reply',
                authorId: 2,
                postId: 1,
                parentCommentId: 1
            });
            expect(component.replyText).toBe('');
            expect(component.replyingTo).toBeNull();
        }));

        it('should not submit empty reply', () => {
            component.replyText = '   ';

            component.submitReply(1);

            expect(forumServiceSpy.createComment).not.toHaveBeenCalled();
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // MARKDOWN TOOLBAR TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Markdown Toolbar', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            tick();
        }));

        it('should insert bold markdown', () => {
            component.newComment = 'Hello World';

            // Simulate inserting bold at position 0
            const mockTextarea = document.createElement('textarea');
            mockTextarea.value = 'Hello World';
            mockTextarea.selectionStart = 0;
            mockTextarea.selectionEnd = 5;

            component.insertMarkdown('**', '**', mockTextarea);

            expect(component.newComment).toContain('**');
        });

        it('should insert italic markdown', () => {
            component.newComment = 'test';

            const mockTextarea = document.createElement('textarea');
            mockTextarea.value = 'test';
            mockTextarea.selectionStart = 0;
            mockTextarea.selectionEnd = 0;

            component.insertMarkdown('*', '*', mockTextarea);

            expect(component.newComment).toContain('*');
        });

        it('should insert link markdown', () => {
            component.newComment = '';

            const mockTextarea = document.createElement('textarea');
            mockTextarea.value = '';
            mockTextarea.selectionStart = 0;
            mockTextarea.selectionEnd = 0;

            component.insertMarkdown('[', '](url)', mockTextarea);

            expect(component.newComment).toContain('[text](url)');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // POST STATUS TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Post Status', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            tick();
        }));

        it('should change post status to RESOLVED', fakeAsync(() => {
            spyOn(window, 'confirm').and.returnValue(true);

            component.changeStatus('RESOLVED');
            tick();

            expect(forumServiceSpy.updatePostStatus).toHaveBeenCalledWith(1, 'RESOLVED');
            expect(component.post?.postStatus).toBe('RESOLVED');
        }));

        it('should not change status if user cancels', () => {
            spyOn(window, 'confirm').and.returnValue(false);

            component.changeStatus('RESOLVED');

            expect(forumServiceSpy.updatePostStatus).not.toHaveBeenCalled();
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // BOOKMARK & SHARE TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Bookmark & Share', () => {

        it('should toggle bookmark', () => {
            expect(component.isBookmarked).toBe(false);

            component.toggleBookmark();
            expect(component.isBookmarked).toBe(true);

            component.toggleBookmark();
            expect(component.isBookmarked).toBe(false);
        });

        it('should copy post link', fakeAsync(() => {
            spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

            component.copyPostLink();
            tick();

            expect(navigator.clipboard.writeText).toHaveBeenCalled();
            expect(component.showCopied).toBe(true);

            tick(2000);
            expect(component.showCopied).toBe(false);
        }));
    });

    // ══════════════════════════════════════════════════════════════════
    // FILE UPLOAD TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('File Upload', () => {

        it('should add files to selectedFiles array', async () => {
            const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            const mockFileList = {
                0: mockFile,
                length: 1,
                item: (index: number) => mockFile
            } as any;

            component.onFilesChanged(mockFileList);
            
            // Wait for FileReader
            await new Promise(resolve => setTimeout(resolve, 100));
            fixture.detectChanges();

            expect(component.selectedFiles.length).toBe(1);
            expect(component.filePreviews.length).toBe(1);
        });

        it('should remove file at index', () => {
            component.selectedFiles = [
                new File([''], 'test1.jpg'),
                new File([''], 'test2.jpg')
            ];
            component.filePreviews = ['preview1', 'preview2'];

            component.removeFile(0);

            expect(component.selectedFiles.length).toBe(1);
            expect(component.filePreviews.length).toBe(1);
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // NAVIGATION TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Navigation', () => {

        it('should navigate back to forum', () => {
            component.goBack();

            expect(routerSpy.navigate).toHaveBeenCalledWith(
                ['../..'],
                { relativeTo: mockActivatedRoute as any }
            );
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ══════════════════════════════════════════════════════════════════

    describe('Helper Methods', () => {

        it('should return correct role badge', () => {
            expect(component.getRoleBadge('DOCTOR')).toBe('🩺 Doctor');
            expect(component.getRoleBadge('PHARMACIST')).toBe('💊 Pharmacist');
            expect(component.getRoleBadge('LAB')).toBe('🧪 Lab Staff');
            expect(component.getRoleBadge('PHYSIO')).toBe('💪 Physiotherapist');
            expect(component.getRoleBadge('PATIENT')).toBe('');
        });

        it('should identify post author', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            component.currentUserId = 1; // Same as post author
            expect(component.isPostAuthor).toBe(true);

            component.currentUserId = 999;
            expect(component.isPostAuthor).toBe(false);
        }));

        it('should format time ago correctly', () => {
            const now = new Date().toISOString();
            expect(component.timeAgo(now)).toBe('just now');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // PREVIEW MODE TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Preview Mode', () => {

        it('should toggle preview mode', () => {
            expect(component.isPreview).toBe(false);

            component.isPreview = true;
            expect(component.isPreview).toBe(true);
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // CLEAR CONTENT TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Clear Content', () => {

        it('should clear content when confirmed', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            component.newComment = 'Some text';
            component.selectedFiles = [new File([''], 'test.jpg')];
            component.filePreviews = ['preview'];

            component.clearContent();

            expect(component.newComment).toBe('');
            expect(component.selectedFiles.length).toBe(0);
            expect(component.filePreviews.length).toBe(0);
        });

        it('should not clear content when cancelled', () => {
            spyOn(window, 'confirm').and.returnValue(false);
            component.newComment = 'Some text';

            component.clearContent();

            expect(component.newComment).toBe('Some text');
        });
    });
});