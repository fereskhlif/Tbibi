import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminForumService } from '../../services/admin-forum.service';

@Component({
  selector: 'app-forum-moderation',
  templateUrl: './forum-moderation.component.html',
  styleUrls: ['./forum-moderation.component.css']
})
export class ForumModerationComponent implements OnInit, OnDestroy {
  stats: any = null;
  posts: any[] = [];
  activeFilter = 'ALL';
  loadingStats = true;
  loadingPosts = true;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;

  private refreshInterval: any;

  filters = [
    { key: 'ALL', label: 'All', icon: '📋' },
    { key: 'TOXIC', label: 'Toxic', icon: '🚫' },
    { key: 'UNCERTAIN', label: 'Uncertain', icon: '⚠️' },
    { key: 'CLEAN', label: 'Clean', icon: '✅' }
  ];

  constructor(private adminForumService: AdminForumService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadPosts();
    this.refreshInterval = setInterval(() => { this.loadStats(); this.loadPosts(); }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  refreshAll(): void { this.loadStats(); this.loadPosts(); }

  loadStats(): void {
    this.loadingStats = true;
    this.adminForumService.getStats().subscribe({
      next: (s: any) => { this.stats = s; this.loadingStats = false; },
      error: () => { this.loadingStats = false; }
    });
  }

  loadPosts(): void {
    // Only show global loading on first load
    if (this.posts.length === 0) this.loadingPosts = true;
    
    this.adminForumService.getPosts(this.activeFilter).subscribe({
      next: (data: any[]) => {
        const stateMap = new Map(this.posts.map(p => [p.postId, p]));
        
        this.posts = data.map(p => {
          const oldPost = stateMap.get(p.postId);
          const expanded = oldPost ? oldPost.expanded : false;
          const newPost = {
            ...p,
            expanded,
            comments: oldPost ? oldPost.comments : undefined,
            selectedIds: oldPost ? oldPost.selectedIds : {},
            removing: oldPost ? oldPost.removing : false
          };

          // If the accordion is open, silently sync its comments to catch any new additions or confirm deletions
          if (expanded) {
            this.adminForumService.getComments(p.postId).subscribe({
              next: (c: any[]) => { newPost.comments = c; }
            });
          }

          return newPost;
        });
        this.loadingPosts = false;
      },
      error: () => { this.loadingPosts = false; }
    });
  }

  setFilter(key: string): void { this.activeFilter = key; this.loadPosts(); }

  togglePost(post: any): void {
    post.expanded = !post.expanded;
    if (post.expanded && post.comments === undefined) {
      if (!post.selectedIds) post.selectedIds = {};
      this.adminForumService.getComments(post.postId).subscribe({
        next: (c: any[]) => { post.comments = c; },
        error: () => { post.comments = []; }
      });
    }
  }

  deletePost(post: any, event?: Event): void {
    if (event) event.stopPropagation();
    post.removing = true;
    this.adminForumService.deletePost(post.postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.postId !== post.postId);
        this.showToast('Post deleted successfully', 'success');
        this.loadStats();
      },
      error: () => { post.removing = false; this.showToast('Error during deletion', 'error'); }
    });
  }

  deleteComment(post: any, commentId: number): void {
    this.adminForumService.deleteComment(commentId).subscribe({
      next: () => {
        post.comments = post.comments.filter((c: any) => c.commentId !== commentId);
        if (post.selectedIds) post.selectedIds[commentId] = false;
        this.showToast('Comment deleted', 'success');
        this.loadStats();
        this.loadPosts(); // Instantly update post percentage
      },
      error: () => this.showToast('Error', 'error')
    });
  }

  toggleComment(post: any, commentId: number): void {
    if (!post.selectedIds) post.selectedIds = {};
    post.selectedIds[commentId] = !post.selectedIds[commentId];
  }

  toggleAllComments(post: any, checked: boolean): void {
    post.selectedIds = {};
    if (checked && post.comments) {
      post.comments.forEach((c: any) => post.selectedIds[c.commentId] = true);
    }
  }

  getSelectedCount(post: any): number {
    if (!post.selectedIds) return 0;
    return Object.values(post.selectedIds).filter(v => v).length;
  }

  deleteSelectedComments(post: any): void {
    if (!post.selectedIds) return;
    const ids = Object.keys(post.selectedIds)
                  .filter(k => post.selectedIds[k])
                  .map(k => Number(k));
    if (!ids.length) return;
    this.adminForumService.deleteComments(ids).subscribe({
      next: () => {
        post.comments = post.comments.filter((c: any) => !post.selectedIds[c.commentId]);
        post.selectedIds = {};
        this.showToast('Comments deleted', 'success');
        this.loadStats();
        this.loadPosts(); // Instantly update post percentage
      },
      error: () => this.showToast('Error during deletion', 'error')
    });
  }

  getToxicPercent(): string {
    if (!this.stats) return '0.0';
    const val = this.stats.toxicPercent;
    if (val === null || val === undefined || isNaN(val)) return '0.0';
    return Number(val).toFixed(1);
  }

  getVerdictClass(v: string): string {
    switch (v) {
      case 'TOXIC': return 'verdict-toxic';
      case 'UNCERTAIN': return 'verdict-uncertain';
      case 'CLEAN': return 'verdict-clean';
      default: return 'verdict-unscored';
    }
  }

  getScoreColor(v: string): string {
    switch (v) {
      case 'TOXIC': return '#ef4444';
      case 'UNCERTAIN': return '#f97316';
      case 'CLEAN': return '#22c55e';
      default: return '#94a3b8';
    }
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  truncate(text: string, max: number): string {
    return text && text.length > max ? text.substring(0, max) + '…' : text || '';
  }

  formatScore(score: any): string {
    if (score === null || score === undefined) return '—';
    return (Number(score) * 100).toFixed(0) + '%';
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
