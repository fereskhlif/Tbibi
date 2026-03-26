import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ForumService } from '../../services/forum.service';
import { CategoryResponse, PostResponse } from '../../models/forum.models';

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
  currentPage = 1;
  postsPerPage = 10;

  // Role Data
  currentRole = 'PATIENT';
  currentUserId = 3;
  currentUserName = 'John Patient';
  expertCategory = '';

  // ── STORED properties (NOT getters) ──
  roleFilteredPosts: PostResponse[] = [];
  filteredPosts: PostResponse[] = [];
  paginatedPosts: PostResponse[] = [];
  visibleCategories: CategoryResponse[] = [];
  filteredCategories: CategoryResponse[] = [];
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

    this.loadData();
  }

  // ═══════════════════════════════════════════════════════════════════
  //  LOAD DATA — forkJoin, NO manual detectChanges()
  // ═══════════════════════════════════════════════════════════════════
  loadData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      categories: this.forumService.getCategories(),
      posts: this.forumService.getPosts()
    }).subscribe({
      next: ({ categories, posts }) => {
        this.ngZone.run(() => {
          this.categories = categories.filter(c => c.active);
          this.posts = posts;
          this.currentPage = 1;
          this.updateViewData();
          this.loading = false;

          // Safety net: one extra CD cycle after DOM settles
          setTimeout(() => {
            this.cdr.markForCheck();
            this.cdr.detectChanges();
          }, 0);
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

  // ═══════════════════════════════════════════════════════════════════
  //  UPDATE VIEW DATA — computes ALL stored properties at once
  // ═══════════════════════════════════════════════════════════════════
  updateViewData(): void {
    // 0. Visible categories (role-based)
    this.visibleCategories = this.computeVisibleCategories();

    // 1. Role-filtered posts
    if (this.currentRole === 'PATIENT') {
      this.roleFilteredPosts = [...this.posts];
    } else {
      const names = this.visibleCategories.map(c => c.categoryName);
      this.roleFilteredPosts = this.posts.filter(p => names.includes(p.categoryName));
    }

    // 2. Filtered categories (search)
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

    // 3. Unanswered / expert counts
    if (this.expertCategory) {
      this.unansweredCount = this.roleFilteredPosts.filter(
        p =>
          p.categoryName === this.expertCategory &&
          p.commentCount === 0 &&
          p.postStatus === 'OPEN'
      ).length;
      this.expertCategoryPostCount = this.roleFilteredPosts.filter(
        p => p.categoryName === this.expertCategory
      ).length;
    } else {
      this.unansweredCount = 0;
      this.expertCategoryPostCount = 0;
    }

    // 4. Main filter (category + status + search + sort)
    let result = [...this.roleFilteredPosts];

    if (this.selectedCategoryId !== null) {
      result = result.filter(p => p.categoryId === this.selectedCategoryId);
    }

    if (this.filterStatus && this.filterStatus !== 'all') {
      result = result.filter(p => p.postStatus === this.filterStatus.toUpperCase());
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (this.sortBy) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        );
        break;
      case 'most_voted':
        result.sort((a, b) => b.voteCount - a.voteCount);
        break;
      case 'latest':
      default:
        result.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return (
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
          );
        });
        break;
    }

    this.filteredPosts = result;

    // 5. Pagination
    const perPage = Number(this.postsPerPage) || 10;
    this.totalPages = Math.max(1, Math.ceil(this.filteredPosts.length / perPage));

    // Clamp current page
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * perPage;
    this.paginatedPosts = this.filteredPosts.slice(start, start + perPage);

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

  selectCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.updateViewData();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateViewData();
  }

  onPerPageChange(): void {
    this.currentPage = 1;
    this.updateViewData();
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
