// src/app/modules/forum/services/forum.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ForumService } from './forum.service';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { CategoryResponse, PostResponse, CommentResponse, VoteResponse, CreatePostRequest, CreateCommentRequest, VoteRequest } from '../models/forum.models';

@Pipe({ name: 'markdown' })
class MockMarkdownPipe implements PipeTransform {
    transform(value: string): string { return value; }
}

describe('ForumService', () => {
    let service: ForumService;
    let httpMock: HttpTestingController;

    const apiUrl = 'http://localhost:8088/api/forum';

    // ══════════════════════════════════════════════════════════════════
    // MOCK DATA
    // ══════════════════════════════════════════════════════════════════

    const mockCategories: CategoryResponse[] = [
        {
            categoryId: 1,
            categoryName: 'Ask a Doctor',
            categoryDescription: 'Medical questions',
            createdAt: '2024-01-01T10:00:00',
            active: true,
            postCount: 10
        },
        {
            categoryId: 2,
            categoryName: 'General Health',
            categoryDescription: 'General health discussions',
            createdAt: '2024-01-02T10:00:00',
            active: true,
            postCount: 5
        }
    ];

    const mockPosts: PostResponse[] = [
        {
            postId: 1,
            title: 'How to manage diabetes?',
            content: 'Looking for advice on diabetes management',
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
            commentCount: 5,
            voteCount: 10,
            mediaUrls: []
        },
        {
            postId: 2,
            title: 'Best exercises for back pain',
            content: 'What exercises help with lower back pain?',
            createdDate: '2024-01-16T10:00:00',
            updatedDate: '2024-01-16T10:00:00',
            views: 50,
            postStatus: 'RESOLVED',
            isPinned: true,
            isDeleted: false,
            authorId: 2,
            authorName: 'Jane Smith',
            categoryId: 2,
            categoryName: 'General Health',
            commentCount: 3,
            voteCount: 8,
            mediaUrls: ['']
        }
    ];

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
                    comment: 'Thank you for the advice!',
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

    const mockVoteResponse: VoteResponse = {
        voteId: 1,
        userId: 1,
        userName: 'John Doe',
        postId: 1,
        createdAt: '2024-01-15T10:00:00'
    };

    // ══════════════════════════════════════════════════════════════════
    // SETUP
    // ══════════════════════════════════════════════════════════════════

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ForumService]
        });

        service = TestBed.inject(ForumService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        // Verify no outstanding HTTP requests
        httpMock.verify();
    });

    // ══════════════════════════════════════════════════════════════════
    // SERVICE CREATION
    // ══════════════════════════════════════════════════════════════════

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // ══════════════════════════════════════════════════════════════════
    // CATEGORY TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Categories', () => {

        it('should fetch all categories', () => {
            // WHEN
            service.getCategories().subscribe(categories => {
                // THEN
                expect(categories.length).toBe(2);
                expect(categories[0].categoryName).toBe('Ask a Doctor');
                expect(categories[1].categoryName).toBe('General Health');
            });

            // Mock HTTP request
            const req = httpMock.expectOne(`${apiUrl}/categories`);
            expect(req.request.method).toBe('GET');
            req.flush(mockCategories);
        });

        it('should handle error when fetching categories fails', () => {
            // WHEN
            service.getCategories().subscribe({
                next: () => fail('Should have failed'),
                error: (error) => {
                    // THEN
                    expect(error.status).toBe(500);
                }
            });

            // Mock HTTP error
            const req = httpMock.expectOne(`${apiUrl}/categories`);
            req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // POST TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Posts', () => {

        it('should fetch all posts', () => {
            service.getPosts().subscribe(posts => {
                expect(posts.length).toBe(2);
                expect(posts[0].title).toBe('How to manage diabetes?');
                expect(posts[1].isPinned).toBe(true);
            });

            const req = httpMock.expectOne(`${apiUrl}/posts`);
            expect(req.request.method).toBe('GET');
            req.flush(mockPosts);
        });

        it('should fetch posts by category', () => {
            const categoryId = 1;

            service.getPostsByCategory(categoryId).subscribe(posts => {
                expect(posts.length).toBe(1);
                expect(posts[0].categoryId).toBe(categoryId);
            });

            const req = httpMock.expectOne(`${apiUrl}/posts/category/${categoryId}`);
            expect(req.request.method).toBe('GET');
            req.flush([mockPosts[0]]);
        });

        it('should fetch a single post by ID', () => {
            const postId = 1;

            service.getPostById(postId).subscribe(post => {
                expect(post.postId).toBe(postId);
                expect(post.title).toBe('How to manage diabetes?');
            });

            const req = httpMock.expectOne(`${apiUrl}/posts/${postId}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockPosts[0]);
        });

        it('should search posts by keyword', () => {
            const keyword = 'diabetes';

            service.searchPosts(keyword).subscribe(posts => {
                expect(posts.length).toBe(1);
                expect(posts[0].title).toContain('diabetes');
            });

            const req = httpMock.expectOne(`${apiUrl}/posts/search?keyword=${keyword}`);
            expect(req.request.method).toBe('GET');
            req.flush([mockPosts[0]]);
        });

        it('should create a new post', () => {
            const newPost: CreatePostRequest = {
                title: 'New Health Question',
                content: 'This is my question about health',
                categoryId: 1,
                authorId: 1
            };

            const createdPost: PostResponse = {
                ...mockPosts[0],
                postId: 3,
                title: newPost.title,
                content: newPost.content
            };

            service.createPost(newPost).subscribe(post => {
                expect(post.postId).toBe(3);
                expect(post.title).toBe(newPost.title);
            });

            const req = httpMock.expectOne(`${apiUrl}/posts`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newPost);
            req.flush(createdPost);
        });

        it('should update post status', () => {
            const postId = 1;
            const newStatus = 'RESOLVED';

            const updatedPost: PostResponse = {
                ...mockPosts[0],
                postStatus: 'RESOLVED'
            };

            service.updatePostStatus(postId, newStatus).subscribe(post => {
                expect(post.postStatus).toBe('RESOLVED');
            });

            const req = httpMock.expectOne(request => 
                request.url === `${apiUrl}/posts/${postId}/status` && 
                request.params.get('status') === newStatus
            );
            expect(req.request.method).toBe('PUT');
            req.flush(updatedPost);
        });

        it('should toggle pin on a post', () => {
            const postId = 1;

            const pinnedPost: PostResponse = {
                ...mockPosts[0],
                isPinned: true
            };

            service.togglePin(postId).subscribe(post => {
                expect(post.isPinned).toBe(true);
            });

            const req = httpMock.expectOne(`${apiUrl}/posts/${postId}/pin`);
            expect(req.request.method).toBe('PUT');
            req.flush(pinnedPost);
        });

        it('should delete a post', () => {
            const postId = 1;

            service.deletePost(postId).subscribe(() => {
                // Success - no response body
            });

            const req = httpMock.expectOne(`${apiUrl}/posts/${postId}`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });

        it('should upload post media', () => {
            const postId = 1;
            const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
            const files = [mockFile];

            const updatedPost: PostResponse = {
                ...mockPosts[0],
                mediaUrls: ['uploaded-image.jpg']
            };

            service.uploadPostMedia(postId, files).subscribe(post => {
                expect(post.mediaUrls.length).toBe(1);
            });

            const req = httpMock.expectOne(`${apiUrl}/posts/${postId}/media`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body instanceof FormData).toBe(true);
            req.flush(updatedPost);
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // COMMENT TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Comments', () => {

        it('should fetch comments for a post', () => {
            const postId = 1;

            service.getCommentsByPost(postId).subscribe(comments => {
                expect(comments.length).toBe(2);
                expect(comments[0].comment).toBe('Great question!');
                expect(comments[1].replies!.length).toBe(1);
            });

            const req = httpMock.expectOne(`${apiUrl}/comments/post/${postId}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockComments);
        });

        it('should create a new comment', () => {
            const newComment: CreateCommentRequest = {
                comment: 'This is helpful!',
                authorId: 1,
                postId: 1,
                parentCommentId: null
            };

            const createdComment: CommentResponse = {
                commentId: 4,
                comment: newComment.comment,
                commentDate: '2024-01-15T15:00:00',
                updatedDate: '2024-01-15T15:00:00',
                isDeleted: false,
                authorId: 1,
                authorName: 'John Doe',
                postId: 1,
                parentCommentId: null,
                isPinned: false,
                voteCount: 0,
                userHasVoted: false,
                replies: []
            };

            service.createComment(newComment).subscribe(comment => {
                expect(comment.commentId).toBe(4);
                expect(comment.comment).toBe(newComment.comment);
            });

            const req = httpMock.expectOne(`${apiUrl}/comments`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newComment);
            req.flush(createdComment);
        });

        it('should create a reply to a comment', () => {
            const replyComment: CreateCommentRequest = {
                comment: 'Thank you for the reply!',
                authorId: 1,
                postId: 1,
                parentCommentId: 2
            };

            const createdReply: CommentResponse = {
                commentId: 5,
                comment: replyComment.comment,
                commentDate: '2024-01-15T16:00:00',
                updatedDate: '2024-01-15T16:00:00',
                isDeleted: false,
                authorId: 1,
                authorName: 'John Doe',
                postId: 1,
                parentCommentId: 2,
                isPinned: false,
                voteCount: 0,
                userHasVoted: false,
                replies: []
            };

            service.createComment(replyComment).subscribe(comment => {
                expect(comment.parentCommentId).toBe(2);
            });

            const req = httpMock.expectOne(`${apiUrl}/comments`);
            expect(req.request.method).toBe('POST');
            req.flush(createdReply);
        });

        it('should update a comment', () => {
            const commentId = 1;
            const newText = 'Updated comment text';

            const updatedComment: CommentResponse = {
                ...mockComments[0],
                comment: newText
            };

            service.updateComment(commentId, newText).subscribe(comment => {
                expect(comment.comment).toBe(newText);
            });

            const req = httpMock.expectOne(request => 
                request.url === `${apiUrl}/comments/${commentId}` && 
                request.params.get('comment') === newText
            );
            expect(req.request.method).toBe('PUT');
            req.flush(updatedComment);
        });

        it('should delete a comment', () => {
            const commentId = 1;

            service.deleteComment(commentId).subscribe(() => {
                // Success
            });

            const req = httpMock.expectOne(`${apiUrl}/comments/${commentId}`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // VOTE TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Votes', () => {

        it('should create a vote', () => {
            const voteRequest: VoteRequest = {
                userId: 1,
                postId: 1
            };

            service.vote(voteRequest).subscribe(vote => {
                expect(vote.voteId).toBe(1);
                expect(vote.userId).toBe(1);
                expect(vote.postId).toBe(1);
            });

            const req = httpMock.expectOne(`${apiUrl}/votes`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(voteRequest);
            req.flush(mockVoteResponse);
        });

        it('should remove a vote (unvote)', () => {
            const userId = 1;
            const postId = 1;

            service.unvote(userId, postId).subscribe(() => {
                // Success
            });

            const req = httpMock.expectOne(request => 
                request.url === `${apiUrl}/votes` && 
                request.params.get('userId') === userId.toString() &&
                request.params.get('postId') === postId.toString()
            );
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });

        it('should get vote count for a post', () => {
            const postId = 1;
            const expectedCount = 10;

            service.getVoteCount(postId).subscribe(count => {
                expect(count).toBe(expectedCount);
            });

            const req = httpMock.expectOne(`${apiUrl}/votes/count/${postId}`);
            expect(req.request.method).toBe('GET');
            req.flush(expectedCount);
        });

        it('should check if user has voted - returns true', () => {
            const userId = 1;
            const postId = 1;

            service.checkVote(userId, postId).subscribe(hasVoted => {
                expect(hasVoted).toBe(true);
            });

            const req = httpMock.expectOne(request => 
                request.url === `${apiUrl}/votes/check` && 
                request.params.get('userId') === userId.toString() &&
                request.params.get('postId') === postId.toString()
            );
            expect(req.request.method).toBe('GET');
            req.flush(true);
        });

        it('should check if user has voted - returns false', () => {
            const userId = 2;
            const postId = 1;

            service.checkVote(userId, postId).subscribe(hasVoted => {
                expect(hasVoted).toBe(false);
            });

            const req = httpMock.expectOne(`${apiUrl}/votes/check?userId=${userId}&postId=${postId}`);
            expect(req.request.method).toBe('GET');
            req.flush(false);
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // ERROR HANDLING TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Error Handling', () => {

        it('should handle 404 error when post not found', () => {
            const postId = 999;

            service.getPostById(postId).subscribe({
                next: () => fail('Should have failed'),
                error: (error) => {
                    expect(error.status).toBe(404);
                }
            });

            const req = httpMock.expectOne(`${apiUrl}/posts/${postId}`);
            req.flush('Post not found', { status: 404, statusText: 'Not Found' });
        });

        it('should handle network error', () => {
            service.getPosts().subscribe({
                next: () => fail('Should have failed'),
                error: (error) => {
                    expect(error.status).toBe(0);
                }
            });

            const req = httpMock.expectOne(`${apiUrl}/posts`);
            req.error(new ProgressEvent('Network error'));
        });

        it('should handle duplicate vote error', () => {
            const voteRequest: VoteRequest = { userId: 1, postId: 1 };

            service.vote(voteRequest).subscribe({
                next: () => fail('Should have failed'),
                error: (error) => {
                    expect(error.status).toBe(400);
                }
            });

            const req = httpMock.expectOne(`${apiUrl}/votes`);
            req.flush('You already voted on this post', { status: 400, statusText: 'Bad Request' });
        });
    });
});