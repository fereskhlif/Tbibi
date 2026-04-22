import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommentResponse } from '../../../models/forum.models';

@Component({
  selector: 'app-comment-item',
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.css']
})
export class CommentItemComponent {

  @Input() comment!: CommentResponse;
  @Input() depth: number = 0;
  @Input() currentUserName: string = 'D';
  @Input() replyingTo: number | null = null;
  @Input() replyText: string = '';
  @Input() submittingReply: boolean = false;
  @Input() isLast = false;
  @Input() isPostAuthor = false;

  @Output() startReplyEvent = new EventEmitter<number>();
  @Output() submitReplyEvent = new EventEmitter<{ commentId: number, text: string }>();
  @Output() replyTextChange = new EventEmitter<string>();
  @Output() toggleVoteEvent = new EventEmitter<CommentResponse>();
  @Output() togglePinEvent = new EventEmitter<number>();

  isCollapsed: boolean = false;
  isHoveringLine: boolean = false;
  isHoveringShowMore: boolean = false;
  replyPreview = false;
  readonly codeBlockPrefix = '\n```\n';
  readonly codeBlockSuffix = '\n```\n';

  getAvatarColor(name: string): string {
    const colors = ['#2563eb', '#7c3aed', '#059669', '#e11d48', '#d97706', '#0891b2'];
    let h = 0;
    for (let i = 0; i < (name?.length || 0); i++) {
      h = name.charCodeAt(i) + ((h << 5) - h);
    }
    return colors[Math.abs(h) % colors.length];
  }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  onStartReply(commentId: number): void {
    this.startReplyEvent.emit(commentId);
  }

  onToggleVote(comment: CommentResponse): void {
    this.toggleVoteEvent.emit(comment);
  }

  onTogglePin(): void {
    this.togglePinEvent.emit(this.comment.commentId);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  onSubmitReply(commentId: number): void {
    this.submitReplyEvent.emit({ commentId, text: this.replyText });
  }

  onReplyTextChange(text: string): void {
    this.replyTextChange.emit(text);
  }

  hasRepliesOrReplying(): boolean {
    return (this.comment.replies && this.comment.replies.length > 0) || this.replyingTo === this.comment.commentId;
  }

  getReplyCount(): number {
    if (!this.comment.replies) return 0;
    // Count all nested replies recursively
    const count = (replies: any[]): number => {
      return replies.reduce((acc, r) => acc + 1 + (r.replies ? count(r.replies) : 0), 0);
    };
    return count(this.comment.replies);
  }

  reportComment(): void {
    if (confirm('Report this comment to moderators?')) {
      // TODO: wire to service
    }
  }

  // Single markdown helper for reply editor
  insertReplyMarkdown(prefix: string, suffix: string, textarea?: HTMLTextAreaElement): void {
    const el = textarea ?? document.querySelector<HTMLTextAreaElement>('textarea');
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    let text = this.replyText;
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
      const rep = prefix + selected + suffix;
      newText = text.substring(0, start) + rep + text.substring(end);
      cs = selected.length === 0 ? start + prefix.length : start;
      ce = selected.length === 0 ? start + prefix.length : start + rep.length;
    }

    this.replyText = newText;
    this.onReplyTextChange(newText);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(cs, ce); });
  }
}