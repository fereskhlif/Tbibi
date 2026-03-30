import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { PostResponse, CommentResponse } from '../../models/forum.models';
import { WebSocketService } from '../../../../services/websocket.service';
import { StompSubscription } from '@stomp/stompjs';

@Component({
  selector: 'app-forum-post',
  templateUrl: './forum-post.component.html'
})
export class ForumPostComponent implements OnInit, OnDestroy {

  postId = 0;
  post: PostResponse | null = null;
  comments: CommentResponse[] = [];
  loading = true;
  error = '';

  // User
  currentRole = 'PATIENT';
  roleBadge = '';
  currentUserId = 1;
  currentUserName = 'Dr. Karim';

  // Vote
  hasVoted = false;
  voteCount = 0;
  votedCommentIds: number[] = [];
  commentSortOrder: 'newest' | 'oldest' = 'oldest';

  // Comment
  newComment = '';
  submittingComment = false;
  changingStatus = false;

  // Reply
  replyingTo: number | null = null;
  replyText = '';
  submittingReply = false;

  // UI
  isPreview = false;
  isBookmarked = false;
  showCopied = false;

  // Files
  selectedFiles: File[] = [];
  filePreviews: string[] = [];

  // WebSocket subscriptions
  private commentSub: StompSubscription | null = null;
  private voteSub: StompSubscription | null = null;

  // Code block marker strings as properties so template can reference them
  // (avoids backtick issues in Angular template expressions)
  readonly codeBlockPrefix = '\n```\n';
  readonly codeBlockSuffix = '\n```\n';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private forumService: ForumService,
    private wsService: WebSocketService
  ) { }

  ngOnInit(): void {
    const data = this.route.snapshot.data['role']
      ? this.route.snapshot.data
      : (this.route.parent?.snapshot.data || {});
    this.currentRole = data['role'] || 'PATIENT';
    this.currentUserId = data['userId'] || 3;
    this.currentUserName = data['userName'] || 'User';
    this.roleBadge = this.getRoleBadge(this.currentRole);
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPost();
  }

  getRoleBadge(role: string): string {
    const map: { [k: string]: string } = {
      'DOCTOR': '🩺 Doctor',
      'PHARMACIST': '💊 Pharmacist',
      'LAB': '🧪 Lab Staff',
      'PHYSIO': '💪 Physiotherapist',
      'PATIENT': ''
    };
    return map[role] || '';
  }

  loadPost(): void {
    this.loading = true;
    this.error = '';
    this.forumService.getPostById(this.postId).subscribe({
      next: (post) => {
        this.post = post;
        this.voteCount = post.voteCount || 0;
        this.loading = false;
        this.loadComments();
        this.checkUserVote();
      },
      error: () => {
        this.error = 'Failed to load this post.';
        this.loading = false;
      }
    });
  }

  private subscribeToRealTimeUpdates(): void {
    // Real-time comments
    this.wsService.subscribe(`/topic/post/${this.postId}/comments`, (msg) => {
      const newComment: CommentResponse = JSON.parse(msg.body);
      // Only add if not from current user (REST already added it locally)
      if (newComment.authorId !== this.currentUserId) {
        // Check if it's a reply or a top-level comment
        if (newComment.parentCommentId) {
          // It's a reply — reload all comments to get proper nesting
          this.loadComments();
        } else {
          // Top-level comment — append to list
          this.comments = [...this.comments, newComment];
        }
      }
    }).then(sub => this.commentSub = sub);

    // Real-time vote count
    this.wsService.subscribe(`/topic/post/${this.postId}/votes`, (msg) => {
      this.voteCount = parseInt(msg.body, 10);
    }).then(sub => this.voteSub = sub);
  }

  ngOnDestroy(): void {
    if (this.commentSub) this.commentSub.unsubscribe();
    if (this.voteSub) this.voteSub.unsubscribe();
  }

  loadComments(): void {
    this.forumService.getCommentsByPost(this.postId).subscribe({
      next: (data) => {
        this.comments = data;
        this.applyVotedComments(this.comments, this.votedCommentIds);
        this.sortComments();
        // Subscribe to real-time updates after first comment load
        if (!this.commentSub && !this.voteSub) {
          this.subscribeToRealTimeUpdates();
        }
      },
      error: () => { }
    });
  }

  // ─── Comment Sorting & Voting ───────────────────────────────────────────

  sortComments(): void {
    if (!this.comments) return;
    this.comments.sort((a, b) => {
      const pinA = !!a.isPinned;
      const pinB = !!b.isPinned;

      // 1. Pinned status first (true first)
      if (pinA && !pinB) return -1;
      if (!pinA && pinB) return 1;

      // 2. Then by chosen date order
      const dateA = new Date(a.commentDate).getTime();
      const dateB = new Date(b.commentDate).getTime();
      return this.commentSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }

  toggleCommentSort(): void {
    this.commentSortOrder = this.commentSortOrder === 'newest' ? 'oldest' : 'newest';
    this.sortComments();
  }

  toggleCommentVote(comment: CommentResponse): void {
    if (!this.currentUserId || this.currentUserId <= 0) return;
    
    if (comment.userHasVoted) {
      this.forumService.unvoteComment(this.currentUserId, comment.commentId).subscribe({
        next: () => {
          comment.userHasVoted = false;
          comment.voteCount = Math.max(0, (comment.voteCount || 0) - 1);
          this.votedCommentIds = this.votedCommentIds.filter(id => id !== comment.commentId);
        }
      });
    } else {
      this.forumService.voteComment(this.currentUserId, comment.commentId).subscribe({
        next: () => {
          comment.userHasVoted = true;
          comment.voteCount = (comment.voteCount || 0) + 1;
          this.votedCommentIds.push(comment.commentId);
        }
      });
    }
  }

  onTogglePin(commentId: number): void {
    if (this.currentUserId <= 0) return;
    
    this.forumService.togglePinComment(commentId, this.currentUserId).subscribe({
      next: () => {
        // Reload comments to reflect new positions and states
        this.loadComments();
      },
      error: (err) => {
        // Show the backend error message (e.g. "Maximum 3 pinned comments reached")
        const msg = err.error?.message || err.message || 'Failed to toggle pin.';
        alert(msg);
      }
    });
  }

  applyVotedComments(comments: CommentResponse[], votedIds: number[]): void {
    if (!comments || !votedIds) return;
    comments.forEach(c => {
      c.userHasVoted = votedIds.includes(c.commentId);
      if (c.replies) {
        this.applyVotedComments(c.replies, votedIds);
      }
    });
  }

  // ─── Post Voting ────────────────────────────────────────────────────────

  onSubmitReplyFromComponent(event: { commentId: number; text: string }): void {
    this.replyText = event.text;
    this.submitReply(event.commentId);
  }

  checkUserVote(): void {
    if (!this.currentUserId || this.currentUserId <= 0) return;
    this.forumService.checkVote(this.currentUserId, this.postId).subscribe({
      next: (voted) => this.hasVoted = voted,
      error: () => { }
    });

    this.forumService.getUserVotedComments(this.currentUserId, this.postId).subscribe({
      next: (ids) => {
        this.votedCommentIds = ids;
        this.applyVotedComments(this.comments, this.votedCommentIds);
      },
      error: () => { }
    });
  }

  toggleVote(): void {
    if (this.hasVoted) {
      this.forumService.unvote(this.currentUserId, this.postId).subscribe({
        next: () => { this.hasVoted = false; this.voteCount--; }
      });
    } else {
      this.forumService.vote({ userId: this.currentUserId, postId: this.postId }).subscribe({
        next: () => { this.hasVoted = true; this.voteCount++; }
      });
    }
  }

  toggleBookmark(): void { this.isBookmarked = !this.isBookmarked; }

  copyPostLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.showCopied = true;
      setTimeout(() => this.showCopied = false, 2000);
    }).catch(() => { });
  }

  // ─── Unified insertMarkdown ───────────────────────────────────────────────
  // Handles ALL toolbar actions via the same logic as the React version
  insertMarkdown(prefix: string, suffix: string, textarea?: HTMLTextAreaElement): void {
    const el = textarea ?? document.querySelector<HTMLTextAreaElement>('textarea');
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const text = this.newComment;
    const selected = text.substring(start, end);

    const isLinePrefix = suffix === '' && ['### ', '> ', '- ', '1. '].includes(prefix);
    const isCodeBlock = prefix === '\n```\n' && suffix === '\n```\n';
    const isLink = prefix === '[' && suffix === '](url)';

    let newText: string, cs: number, ce: number;

    if (isCodeBlock) {
      const p = '\n```\n', s = '\n```\n';
      const rep = p + selected + s;
      newText = text.substring(0, start) + rep + text.substring(end);
      cs = start + p.length;
      ce = cs + selected.length;

    } else if (isLink) {
      if (selected) {
        const rep = `[${selected}](url)`;
        newText = text.substring(0, start) + rep + text.substring(end);
        cs = start + selected.length + 3;
        ce = cs + 3;
      } else {
        newText = text.substring(0, start) + '[text](url)' + text.substring(end);
        cs = start + 1;
        ce = start + 5;
      }

    } else if (isLinePrefix) {
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      newText = text.substring(0, lineStart) + prefix + text.substring(lineStart);
      cs = start + prefix.length;
      ce = end + prefix.length;

    } else {
      // Wrap: bold, italic, strikethrough
      const rep = prefix + selected + suffix;
      newText = text.substring(0, start) + rep + text.substring(end);
      cs = selected.length === 0 ? start + prefix.length : start;
      ce = selected.length === 0 ? start + prefix.length : start + rep.length;
    }

    this.newComment = newText;
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(cs, ce); });
  }

  clearContent(): void {
    if (confirm('Clear your comment?')) {
      this.newComment = '';
      this.selectedFiles = [];
      this.filePreviews = [];
    }
  }

  onFilesChanged(files: FileList | null): void {
    if (!files) return;
    Array.from(files).forEach(file => {
      this.selectedFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => this.filePreviews.push(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  removeFile(i: number): void {
    this.selectedFiles.splice(i, 1);
    this.filePreviews.splice(i, 1);
  }

  submitComment(): void {
    if (!this.newComment.trim()) return;
    this.submittingComment = true;
    this.forumService.createComment({
      comment: this.newComment,
      authorId: this.currentUserId,
      postId: this.postId,
      parentCommentId: null
    }).subscribe({
      next: () => {
        this.newComment = '';
        this.submittingComment = false;
        this.isPreview = false;
        this.loadComments();
      },
      error: () => this.submittingComment = false
    });
  }

  startReply(commentId: number): void {
    this.replyingTo = this.replyingTo === commentId ? null : commentId;
    this.replyText = '';
  }

  submitReply(parentCommentId: number): void {
    if (!this.replyText.trim()) return;
    this.submittingReply = true;
    this.forumService.createComment({
      comment: this.replyText,
      authorId: this.currentUserId,
      postId: this.postId,
      parentCommentId
    }).subscribe({
      next: () => {
        this.replyText = '';
        this.replyingTo = null;
        this.submittingReply = false;
        this.loadComments();
      },
      error: () => this.submittingReply = false
    });
  }

  changeStatus(newStatus: string): void {
    if (!confirm('Change post status?')) return;
    this.changingStatus = true;
    this.forumService.updatePostStatus(this.postId, newStatus).subscribe({
      next: (p) => { this.post = p; this.changingStatus = false; },
      error: () => this.changingStatus = false
    });
  }

  get isPostAuthor(): boolean { return this.post?.authorId === this.currentUserId; }

  goBack(): void { this.router.navigate(['../..'], { relativeTo: this.route }); }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr), now = new Date();
    const s = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}