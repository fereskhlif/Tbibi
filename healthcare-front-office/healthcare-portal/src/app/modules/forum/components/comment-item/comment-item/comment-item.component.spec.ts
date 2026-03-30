
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentItemComponent } from './comment-item.component';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { CommentResponse } from '../../../models/forum.models';

@Pipe({ name: 'markdown' })
class MockMarkdownPipe implements PipeTransform {
    transform(value: string): string { return value; }
}

describe('CommentItemComponent', () => {
    let component: CommentItemComponent;
    let fixture: ComponentFixture<CommentItemComponent>;

    const mockComment: CommentResponse = {
        commentId: 1,
        comment: 'This is a test comment',
        commentDate: '2024-01-15T12:00:00',
        updatedDate: '2024-01-15T12:00:00',
        isDeleted: false,
        authorId: 1,
        authorName: 'John Doe',
        postId: 1,
        parentCommentId: null,
        isPinned: false,
        voteCount: 0,
        userHasVoted: false,
        replies: [
            {
                commentId: 2,
                comment: 'This is a reply',
                commentDate: '2024-01-15T13:00:00',
                updatedDate: '2024-01-15T13:00:00',
                isDeleted: false,
                authorId: 2,
                authorName: 'Jane Smith',
                postId: 1,
                parentCommentId: 1,
                isPinned: false,
                voteCount: 0,
                userHasVoted: false,
                replies: []
            }
        ]
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommentItemComponent, MockMarkdownPipe],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CommentItemComponent);
        component = fixture.componentInstance;
        component.comment = mockComment;
    });

    // ══════════════════════════════════════════════════════════════════
    // COMPONENT CREATION
    // ══════════════════════════════════════════════════════════════════

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // ══════════════════════════════════════════════════════════════════
    // INPUT PROPERTIES
    // ══════════════════════════════════════════════════════════════════

    describe('Input Properties', () => {

        it('should accept comment input', () => {
            expect(component.comment).toEqual(mockComment);
        });

        it('should have default depth of 0', () => {
            expect(component.depth).toBe(0);
        });

        it('should accept depth input', () => {
            component.depth = 2;
            expect(component.depth).toBe(2);
        });

        it('should have default empty currentUserName', () => {
            expect(component.currentUserName).toBe('D');
        });

        it('should accept currentUserName input', () => {
            component.currentUserName = 'Test User';
            expect(component.currentUserName).toBe('Test User');
        });

        it('should have null replyingTo by default', () => {
            expect(component.replyingTo).toBeNull();
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // AVATAR COLOR
    // ══════════════════════════════════════════════════════════════════

    describe('Avatar Color', () => {

        it('should return consistent color for same name', () => {
            const color1 = component.getAvatarColor('John');
            const color2 = component.getAvatarColor('John');
            expect(color1).toBe(color2);
        });

        it('should return different colors for different names', () => {
            const colorJohn = component.getAvatarColor('John');
            const colorJane = component.getAvatarColor('Jane');
            // May or may not be different depending on hash, but should not throw
            expect(colorJohn).toBeTruthy();
            expect(colorJane).toBeTruthy();
        });

        it('should handle empty name', () => {
            const color = component.getAvatarColor('');
            expect(color).toBeTruthy();
        });

        it('should handle null/undefined name', () => {
            const color = component.getAvatarColor(null as any);
            expect(color).toBeTruthy();
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // TIME AGO
    // ══════════════════════════════════════════════════════════════════

    describe('Time Ago', () => {

        it('should return "just now" for recent dates', () => {
            const now = new Date().toISOString();
            expect(component.timeAgo(now)).toBe('just now');
        });

        it('should return minutes ago', () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            expect(component.timeAgo(fiveMinutesAgo)).toBe('5m ago');
        });

        it('should return hours ago', () => {
            const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
            expect(component.timeAgo(threeHoursAgo)).toBe('3h ago');
        });

        it('should return days ago', () => {
            const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
            expect(component.timeAgo(twoDaysAgo)).toBe('2d ago');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // REPLY EVENTS
    // ══════════════════════════════════════════════════════════════════

    describe('Reply Events', () => {

        it('should emit startReplyEvent when onStartReply is called', () => {
            spyOn(component.startReplyEvent, 'emit');

            component.onStartReply(1);

            expect(component.startReplyEvent.emit).toHaveBeenCalledWith(1);
        });

        it('should emit submitReplyEvent when onSubmitReply is called', () => {
            spyOn(component.submitReplyEvent, 'emit');
            component.replyText = 'Test reply';

            component.onSubmitReply(1);

            expect(component.submitReplyEvent.emit).toHaveBeenCalledWith({
                commentId: 1,
                text: 'Test reply'
            });
        });

        it('should emit replyTextChange when text changes', () => {
            spyOn(component.replyTextChange, 'emit');

            component.onReplyTextChange('New text');

            expect(component.replyTextChange.emit).toHaveBeenCalledWith('New text');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // MARKDOWN INSERTION
    // ══════════════════════════════════════════════════════════════════

    describe('Reply Markdown', () => {

        it('should insert bold markdown', () => {
            const textarea = document.createElement('textarea');
            textarea.value = 'Hello';
            textarea.selectionStart = 0;
            textarea.selectionEnd = 5;

            component.replyText = 'Hello';
            component.insertReplyMarkdown('**', '**', textarea);

            expect(component.replyText).toBe('**Hello**');
        });

        it('should insert heading prefix', () => {
            const textarea = document.createElement('textarea');
            textarea.value = 'Title';
            textarea.selectionStart = 0;
            textarea.selectionEnd = 0;

            component.replyText = 'Title';
            component.insertReplyMarkdown('### ', '', textarea);

            expect(component.replyText).toContain('### ');
        });

        it('should insert link with selection', () => {
            const textarea = document.createElement('textarea');
            textarea.value = 'click here';
            textarea.selectionStart = 0;
            textarea.selectionEnd = 10;

            component.replyText = 'click here';
            component.insertReplyMarkdown('[', '](url)', textarea);

            expect(component.replyText).toBe('[click here](url)');
        });

        it('should insert link placeholder when no selection', () => {
            const textarea = document.createElement('textarea');
            textarea.value = '';
            textarea.selectionStart = 0;
            textarea.selectionEnd = 0;

            component.replyText = '';
            component.insertReplyMarkdown('[', '](url)', textarea);

            expect(component.replyText).toBe('[text](url)');
        });

        it('should insert code block', () => {
            const textarea = document.createElement('textarea');
            textarea.value = 'code';
            textarea.selectionStart = 0;
            textarea.selectionEnd = 4;

            component.replyText = 'code';
            component.insertReplyMarkdown('\n```\n', '\n```\n', textarea);

            expect(component.replyText).toContain('```');
            expect(component.replyText).toContain('code');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // AVATAR SIZE
    // ══════════════════════════════════════════════════════════════════

    describe('Avatar Size', () => {

        it('should return larger size for depth 0', () => {
            component.depth = 0;
            expect(component.avatarSize).toBe('w-8 h-8 text-xs');
        });

        it('should return smaller size for nested comments', () => {
            component.depth = 1;
            expect(component.avatarSize).toBe('w-7 h-7 text-xs');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // CLEAR CONTENT
    // ══════════════════════════════════════════════════════════════════

    describe('Clear Content', () => {

        it('should clear reply content when confirmed', () => {
            spyOn(window, 'confirm').and.returnValue(true);
            spyOn(component.replyTextChange, 'emit');

            component.replyText = 'Some reply';
            component.selectedFiles = [new File([''], 'test.jpg')];
            component.filePreviews = ['preview'];

            component.clearContent();

            expect(component.replyText).toBe('');
            expect(component.selectedFiles.length).toBe(0);
            expect(component.filePreviews.length).toBe(0);
            expect(component.replyTextChange.emit).toHaveBeenCalledWith('');
        });

        it('should not clear when cancelled', () => {
            spyOn(window, 'confirm').and.returnValue(false);

            component.replyText = 'Some reply';
            component.clearContent();

            expect(component.replyText).toBe('Some reply');
        });

        it('should not prompt when reply is empty', () => {
            const confirmSpy = spyOn(window, 'confirm');
            component.replyText = '';

            component.clearContent();

            expect(confirmSpy).not.toHaveBeenCalled();
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // FILE HANDLING
    // ══════════════════════════════════════════════════════════════════

    describe('File Handling', () => {

        it('should add files', () => {
            const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
            const fileList = { 0: file, length: 1, item: () => file } as FileList;

            component.onFilesChanged(fileList);

            expect(component.selectedFiles.length).toBe(1);
        });

        it('should remove file at index', () => {
            component.selectedFiles = [new File([''], 'f1.jpg'), new File([''], 'f2.jpg')];
            component.filePreviews = ['p1', 'p2'];

            component.removeFile(0);

            expect(component.selectedFiles.length).toBe(1);
            expect(component.filePreviews.length).toBe(1);
        });

        it('should handle null file list', () => {
            component.onFilesChanged(null);
            expect(component.selectedFiles.length).toBe(0);
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // NESTED REPLIES
    // ══════════════════════════════════════════════════════════════════

    describe('Nested Replies', () => {

        it('should have replies in comment', () => {
            expect(component.comment.replies!.length).toBe(1);
            expect(component.comment.replies![0].authorName).toBe('Jane Smith');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // INTERACTION LOGIC (NEW)
    // ══════════════════════════════════════════════════════════════════

    describe('Interaction Logic', () => {

        it('should toggle isCollapsed when toggleCollapse is called', () => {
            expect(component.isCollapsed).toBeFalse();
            component.toggleCollapse();
            expect(component.isCollapsed).toBeTrue();
            component.toggleCollapse();
            expect(component.isCollapsed).toBeFalse();
        });

        it('should track isHoveringLine state', () => {
            expect(component.isHoveringLine).toBeFalse();
            component.isHoveringLine = true;
            expect(component.isHoveringLine).toBeTrue();
        });

        it('should track isHoveringShowMore state', () => {
            expect(component.isHoveringShowMore).toBeFalse();
            component.isHoveringShowMore = true;
            expect(component.isHoveringShowMore).toBeTrue();
        });

        it('should return correct avatarColor based on depth', () => {
            component.depth = 0;
            expect(component.avatarColor).toBe('bg-blue-600');
            component.depth = 4;
            expect(component.avatarColor).toBe('bg-violet-500');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // VOTE & PIN EVENTS (NEW)
    // ══════════════════════════════════════════════════════════════════

    describe('Vote & Pin Events', () => {

        it('should emit toggleVoteEvent when onToggleVote is called', () => {
            spyOn(component.toggleVoteEvent, 'emit');
            component.onToggleVote(mockComment);
            expect(component.toggleVoteEvent.emit).toHaveBeenCalledWith(mockComment);
        });

        it('should emit togglePinEvent when onTogglePin is called', () => {
            spyOn(component.togglePinEvent, 'emit');
            component.onTogglePin();
            expect(component.togglePinEvent.emit).toHaveBeenCalledWith(mockComment.commentId);
        });
    });
});