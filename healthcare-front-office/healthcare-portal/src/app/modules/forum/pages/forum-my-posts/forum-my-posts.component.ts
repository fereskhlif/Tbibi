import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { ForumService } from '../../services/forum.service';
import { PostResponse } from '../../models/forum.models';

@Component({
  selector: 'app-forum-my-posts',
  templateUrl: './forum-my-posts.component.html'
})
export class ForumMyPostsComponent implements OnInit {
  posts: PostResponse[] = [];
  loading = true;
  error = '';
  
  currentUserId = 1;
  currentUserName = 'Karim Patient';

  // Filter & Pagination state
  filterStatus: string = 'all';
  filterCategory: string = 'all'; // New filter
  sortBy: string = 'newest';
  categories: string[] = []; // List of available categories
  searchQuery: string = '';
  currentPage: number = 1;
  postsPerPage: number = 10;
  
  filteredPosts: PostResponse[] = [];
  paginatedPosts: PostResponse[] = [];
  totalPages: number = 1;
  pageNumbers: number[] = [];

  constructor(
    private forumService: ForumService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    const data = this.route.snapshot.data['role']
      ? this.route.snapshot.data
      : this.route.parent?.snapshot.data || {};

    this.currentUserId = data['userId'] || 1;
    this.currentUserName = data['userName'] || 'User';

    this.titleService.setTitle('My Discussions | Community Forum');
    this.loadMyPosts();
  }

  loadMyPosts(): void {
    this.loading = true;
    this.error = '';

    this.forumService.getPostsByAuthor(this.currentUserId).subscribe({
      next: (posts) => {
        this.ngZone.run(() => {
          this.posts = posts;
          this.extractCategories(); // Extract categories from posts
          this.applyFilters();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.error = 'Failed to load your posts. Please try again.';
          this.loading = false;
        });
      }
    });
  }

  applyFilters(): void {
    let result = [...this.posts];

    // Filter by category
    if (this.filterCategory !== 'all') {
      result = result.filter(p => p.categoryName === this.filterCategory);
    }

    // 1. Filter by Status
    if (this.filterStatus !== 'all') {
      result = result.filter(p => p.postStatus === this.filterStatus);
    }

    // 2. Search (optional but good for consistency)
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q)
      );
    }

    // 3. Sort
    result.sort((a, b) => {
      if (this.sortBy === 'newest') {
        return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      } else if (this.sortBy === 'oldest') {
        return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      } else if (this.sortBy === 'most_voted') {
        return b.voteCount - a.voteCount;
      }
      return 0;
    });

    this.filteredPosts = result;

    // 4. Pagination
    this.totalPages = Math.max(1, Math.ceil(this.filteredPosts.length / this.postsPerPage));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    
    const start = (this.currentPage - 1) * this.postsPerPage;
    this.paginatedPosts = this.filteredPosts.slice(start, start + this.postsPerPage);

    // 5. Page Numbers
    this.pageNumbers = [];
    for (let i = 1; i <= this.totalPages; i++) {
        this.pageNumbers.push(i);
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  extractCategories() {
    const categoriesSet = new Set(this.posts.map(p => p.categoryName).filter(Boolean));
    this.categories = Array.from(categoriesSet).sort();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  openPost(id: number): void {
    this.router.navigate(['/forum/post', id]);
  }

  deletePost(id: number, event: Event): void {
    event.stopPropagation(); // Prevent opening the post
    if (window.confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      this.forumService.deletePost(id).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => Number(p.postId) !== id);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error deleting post:', err);
          alert('Failed to delete the post. Please try again.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  getCategoryColor(categoryName: string): string {
    const colors: { [key: string]: string } = {
      'Ask a Doctor': 'bg-blue-100 text-blue-700',
      'Ask a Pharmacist': 'bg-purple-100 text-purple-700',
      'Ask a Lab': 'bg-yellow-100 text-yellow-700',
      'Ask a Physiotherapist': 'bg-orange-100 text-orange-700',
      'General Health': 'bg-green-100 text-green-700',
      'Mental Health': 'bg-pink-100 text-pink-700',
      'Nutrition & Diet': 'bg-lime-100 text-lime-700',
      'Fitness & Wellness': 'bg-teal-100 text-teal-700',
      'Women Health': 'bg-rose-100 text-rose-700',
      'Children Health': 'bg-cyan-100 text-cyan-700',
      'Chronic Diseases': 'bg-red-100 text-red-700',
      'Medications & Side Effects': 'bg-violet-100 text-violet-700',
      'First Aid & Emergencies': 'bg-amber-100 text-amber-700',
      'Healthy Lifestyle': 'bg-emerald-100 text-emerald-700'
    };
    return colors[categoryName] || 'bg-gray-100 text-gray-600';
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
