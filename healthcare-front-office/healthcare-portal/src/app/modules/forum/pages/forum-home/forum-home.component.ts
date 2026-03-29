import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ForumService } from '../../services/forum.service';
import { CategoryResponse, PostResponse, Page } from '../../models/forum.models';

@Component({
  selector: 'app-forum-home',
  templateUrl: './forum-home.component.html'
})
export class ForumHomeComponent implements OnInit {
  categories: CategoryResponse[] = [];
  posts: PostResponse[] = [];
  loading = true;
  error = '';
  searchQuery = '';

  // Category filter
  selectedCategoryId: number | null = null;

  // Sort & Filter
  sortBy: string = 'latest';
  filterStatus: string = 'all';

  // Pagination
  currentPage = 1; // 1-indexed for UI
  postsPerPage = 12;
  totalElements = 0;
  
  private searchSubject = new Subject<string>();

  // Role Data
  currentRole = 'PATIENT';
  currentUserId = 3;
  currentUserName = 'John Patient';
  expertCategory = '';

  paginatedPosts: PostResponse[] = [];
  visibleCategories: CategoryResponse[] = [];
  filteredCategories: CategoryResponse[] = [];
  globalTotalPosts = 0;
  totalPages = 1;
  pageNumbers: number[] = [];
  unansweredCount = 0;
  expertCategoryPostCount = 0;

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

    this.currentRole = data['role'] || 'PATIENT';
    this.currentUserId = data['userId'] || 3;
    this.currentUserName = data['userName'] || 'User';
    this.expertCategory = data['expertCategory'] || '';

    this.titleService.setTitle(this.bannerTitle);
    document.title = data['title'] || 'Community Forum';

    // Search Debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.currentPage = 1;
      this.syncUrlAndLoad();
    });

    // Subscribe to query params to update selection and page
    this.route.queryParams.subscribe(params => {
      const catName = params['cat'];
      const page = params['page'] ? +params['page'] : 1;
      const search = params['q'] || '';
      const sort = params['sort'] || 'latest';
      const status = params['status'] || 'all';
      
      this.currentPage = page;
      this.searchQuery = search;
      this.sortBy = sort;
      this.filterStatus = status;

      if (this.categories.length > 0) {
        this.syncCategoryFromUrl(catName);
        this.loadPostsOnly(); // Fetch new page/filter
      } else {
        this.loadData(); // Initial load (categories + posts)
      }
    });
  }

  private syncUrlAndLoad(): void {
    const catName = this.categories.find(c => c.categoryId === this.selectedCategoryId)?.categoryName || null;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        cat: catName,
        page: this.currentPage,
        q: this.searchQuery || null,
        sort: this.sortBy,
        status: this.filterStatus
      },
      queryParamsHandling: 'merge'
    });
  }


  private syncCategoryFromUrl(catName: string | null): void {
    if (!catName) {
      this.selectedCategoryId = null;
      return;
    }
    const found = this.categories.find(c => c.categoryName === catName);
    this.selectedCategoryId = found ? found.categoryId : null;
  }

  // ═══════════════════════════════════════════════════════════════════
  //  LOAD DATA — forkJoin, NO manual detectChanges()
  // ═══════════════════════════════════════════════════════════════════
  loadData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      categories: this.forumService.getCategories(),
      postsPage: this.getPostsObservable()
    }).subscribe({
      next: ({ categories, postsPage }) => {
        this.ngZone.run(() => {
          this.categories = categories.filter(c => c.active);
          
          // Sync with URL after loading categories
          const catName = this.route.snapshot.queryParams['cat'];
          this.syncCategoryFromUrl(catName);
          
          this.handlePostsPage(postsPage);
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.error = 'Failed to load data. Please try again.';
          this.loading = false;
        });
      }
    });
  }

  loadPostsOnly(): void {
    this.loading = true;
    this.getPostsObservable().subscribe({
      next: (page) => {
        this.handlePostsPage(page);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load posts.';
        this.loading = false;
      }
    });
  }

  private getPostsObservable() {
    const page0 = this.currentPage - 1;
    const status = this.filterStatus === 'all' ? undefined : this.filterStatus.toUpperCase();
    
    if (this.searchQuery.trim()) {
      return this.forumService.searchPostsPaginated(this.searchQuery, page0, this.postsPerPage, status, this.sortBy);
    } else if (this.selectedCategoryId !== null) {
      return this.forumService.getPostsByCategoryPaginated(this.selectedCategoryId, page0, this.postsPerPage, status, this.sortBy);
    } else {
      return this.forumService.getPostsPaginated(page0, this.postsPerPage, status, this.sortBy);
    }
  }

  private handlePostsPage(page: Page<PostResponse>): void {
    this.posts = page.content;
    this.totalElements = page.totalElements;
    this.totalPages = page.totalPages;
    this.updateViewData();
  }

  onFilterChange(event: any) {
    this.filterStatus = event.target.value;
    this.currentPage = 1;
    this.syncUrlAndLoad();
  }

  onSortChange(event: any) {
    this.sortBy = event.target.value;
    this.currentPage = 1;
    this.syncUrlAndLoad();
  }

  // ═══════════════════════════════════════════════════════════════════
  //  UPDATE VIEW DATA — computes ALL stored properties at once
  // ═══════════════════════════════════════════════════════════════════
  updateViewData(): void {
    // 0. Visible categories (role-based)
    this.visibleCategories = this.computeVisibleCategories();
    this.globalTotalPosts = this.visibleCategories.reduce((acc, c) => acc + (c.postCount || 0), 0);

    // 1. Filtered categories (Frontend search)
    if (!this.searchQuery.trim()) {
      this.filteredCategories = [...this.visibleCategories];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredCategories = this.visibleCategories.filter(
        c =>
          c.categoryName.toLowerCase().includes(q) ||
          c.categoryDescription.toLowerCase().includes(q)
      );
    }

    // 2. Expert counts (FETCH FROM SERVER IF EXPERT)
    if (this.currentRole !== 'PATIENT' && this.selectedCategoryId) {
      this.forumService.getCategoryStats(this.selectedCategoryId).subscribe(stats => {
        this.expertCategoryPostCount = stats.totalPosts;
        this.unansweredCount = stats.unansweredCount;
        this.cdr.detectChanges();
      });
    }

    this.paginatedPosts = [...this.posts];

    // 6. Page numbers
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    this.pageNumbers = pages;
  }

  // ═══════════════════════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════════════════════

  private computeVisibleCategories(): CategoryResponse[] {
    if (this.currentRole === 'PATIENT') {
      return this.categories;
    }
    if (this.currentRole === 'DOCTOR') {
      return this.categories.filter(c =>
        [
          'Ask a Doctor',
          'General Health',
          'Mental Health',
          'Chronic Diseases',
          'First Aid & Emergencies',
          'Children Health',
          'Women Health'
        ].includes(c.categoryName)
      );
    }
    if (this.currentRole === 'PHARMACIST') {
      return this.categories.filter(c =>
        [
          'Ask a Pharmacist',
          'General Health',
          'Medications & Side Effects',
          'Nutrition & Diet'
        ].includes(c.categoryName)
      );
    }
    if (this.currentRole === 'LAB') {
      return this.categories.filter(c =>
        ['Ask a Lab', 'General Health', 'Chronic Diseases'].includes(
          c.categoryName
        )
      );
    }
    if (this.currentRole === 'PHYSIO') {
      return this.categories.filter(c =>
        [
          'Ask a Physiotherapist',
          'General Health',
          'Fitness & Wellness',
          'Healthy Lifestyle'
        ].includes(c.categoryName)
      );
    }
    return this.categories;
  }

  get isPatient(): boolean {
    return this.currentRole === 'PATIENT';
  }

  get isProfessional(): boolean {
    return this.currentRole !== 'PATIENT';
  }

  get bannerTitle(): string {
    const titles: { [key: string]: string } = {
      PATIENT: 'Community Forum',
      DOCTOR: 'Doctor Forum',
      PHARMACIST: 'Pharmacist Forum',
      LAB: 'Lab Results Forum',
      PHYSIO: 'Physiotherapy Forum'
    };
    return titles[this.currentRole] || 'Community Forum';
  }

  get bannerSubtitle(): string {
    const subtitles: { [key: string]: string } = {
      PATIENT:
        'Ask questions, share knowledge, get answers from healthcare professionals',
      DOCTOR: 'Help patients by answering their medical questions',
      PHARMACIST: 'Answer medication and pharmacy questions from patients',
      LAB: 'Help patients understand their lab test results',
      PHYSIO: 'Guide patients through their physiotherapy journey'
    };
    return subtitles[this.currentRole] || '';
  }

  needsAnswer(post: PostResponse): boolean {
    return (
      this.isProfessional &&
      post.commentCount === 0 &&
      post.categoryName === this.expertCategory &&
      post.postStatus === 'OPEN'
    );
  }

  selectCategory(categoryName: string | null): void {
    this.currentPage = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { cat: categoryName, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  onSearch(query: string): void {
    this.searchSubject.next(query);
  }


  getSelectedIndex(): number {
    if (this.selectedCategoryId === null) return 0;
    // +1 because "View All" is at index 0
    const idx = this.filteredCategories.findIndex(c => c.categoryId === this.selectedCategoryId);
    return idx !== -1 ? idx + 1 : 0;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.syncUrlAndLoad();
  }

  onPerPageChange(): void {
    this.currentPage = 1;
    this.syncUrlAndLoad();
  }


  trackByCat(_index: number, cat: CategoryResponse): number {
    return cat.categoryId;
  }

  trackByPost(_index: number, post: PostResponse): number {
    return post.postId;
  }

  trackByPage(_index: number, page: number): number {
    return page;
  }

  openPost(id: number): void {
    this.router.navigate(['post', id], { relativeTo: this.route });
  }

  goNewPost(): void {
    this.router.navigate(['new-post'], { relativeTo: this.route });
  }

  // ── Category styling helpers (return strings – safe for templates) ──

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

  getCategoryIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'Ask a Doctor': 'stethoscope',
      'Ask a Pharmacist': 'package',
      'Ask a Lab': 'flask-conical',           // ← FIXED (beaker doesn't exist)
      'Ask a Physiotherapist': 'activity',
      'General Health': 'heart-pulse',
      'Mental Health': 'cpu',
      'Nutrition & Diet': 'leaf',
      'Fitness & Wellness': 'activity',
      'Women Health': 'heart',
      'Children Health': 'smile',
      'Chronic Diseases': 'shield-alert',
      'Medications & Side Effects': 'package',
      'First Aid & Emergencies': 'circle-plus',  // ← FIXED (plus-circle renamed)
      'Healthy Lifestyle': 'sun'
    };
    return icons[categoryName] || 'message-square';
  }

  getCategoryIconBg(categoryName: string): string {
    const bgs: { [key: string]: string } = {
      'Ask a Doctor': 'bg-blue-50',
      'Ask a Pharmacist': 'bg-purple-50',
      'Ask a Lab': 'bg-yellow-50',
      'Ask a Physiotherapist': 'bg-orange-50',
      'General Health': 'bg-green-50',
      'Mental Health': 'bg-pink-50',
      'Nutrition & Diet': 'bg-lime-50',
      'Fitness & Wellness': 'bg-teal-50',
      'Women Health': 'bg-rose-50',
      'Children Health': 'bg-cyan-50',
      'Chronic Diseases': 'bg-red-50',
      'Medications & Side Effects': 'bg-violet-50',
      'First Aid & Emergencies': 'bg-amber-50',
      'Healthy Lifestyle': 'bg-emerald-50'
    };
    return bgs[categoryName] || 'bg-gray-50';
  }

  getCategoryIconColor(categoryName: string): string {
    const colors: { [key: string]: string } = {
      'Ask a Doctor': 'text-blue-500',
      'Ask a Pharmacist': 'text-purple-500',
      'Ask a Lab': 'text-yellow-600',
      'Ask a Physiotherapist': 'text-orange-500',
      'General Health': 'text-green-500',
      'Mental Health': 'text-pink-500',
      'Nutrition & Diet': 'text-lime-600',
      'Fitness & Wellness': 'text-teal-600',
      'Women Health': 'text-rose-500',
      'Children Health': 'text-cyan-600',
      'Chronic Diseases': 'text-red-500',
      'Medications & Side Effects': 'text-violet-500',
      'First Aid & Emergencies': 'text-amber-600',
      'Healthy Lifestyle': 'text-emerald-500'
    };
    return colors[categoryName] || 'text-gray-400';
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
