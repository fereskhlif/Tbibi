import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { PostResponse, CategoryResponse } from '../../models/forum.models';

@Component({
  selector: 'app-forum-category',
  templateUrl: './forum-category.component.html'
})
export class ForumCategoryComponent implements OnInit {
  categoryId = 0;
  category: CategoryResponse | null = null;
  posts: PostResponse[] = [];
  loading = true;
  error = '';
  searchQuery = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private forumService: ForumService
  ) {}

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    this.forumService.getCategories().subscribe({
      next: (cats) => {
        this.category = cats.find(c => c.categoryId === this.categoryId) || null;
      }
    });

    this.forumService.getPostsByCategory(this.categoryId).subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load posts.';
        this.loading = false;
      }
    });
  }

  get filteredPosts(): PostResponse[] {
    let list = [...this.posts];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q));
    }
    // Pinned first, then newest
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });
    return list;
  }

  openPost(id: number): void {
    this.router.navigate(['/forum/post', id]);
  }

  goBack(): void {
    this.router.navigate(['/forum']);
  }

  goNewPost(): void {
    this.router.navigate(['/forum/new-post']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'OPEN': return 'bg-emerald-50 text-emerald-700';
      case 'CLOSED': return 'bg-gray-100 text-gray-600';
      case 'RESOLVED': return 'bg-blue-50 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  timeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
