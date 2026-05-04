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

    const currentRole = this.normalizeRole(localStorage.getItem('RoleUserConnect') || localStorage.getItem('userRole') || 'PATIENT');

    this.forumService.getCategories().subscribe({
      next: (cats) => {
        this.category = cats.find(c => c.categoryId === this.categoryId) || null;
        
        // Expertise check for professionals
        if (this.category && currentRole !== 'PATIENT' && !this.canProfessionalAccess(currentRole, this.category.categoryName)) {
          this.error = 'You do not have the required expertise to access this category.';
          this.loading = false;
          return;
        }

        this.loadPosts();
      },
      error: () => {
        this.error = 'Failed to load category information.';
        this.loading = false;
      }
    });
  }

  private loadPosts(): void {
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

  private normalizeRole(role: string): string {
    const r = role ? role.toUpperCase().trim() : 'PATIENT';
    if (r.includes('DOCTOR') || r.includes('DOCTEUR')) return 'DOCTOR';
    if (r.includes('PHARMACIST') || r.includes('PHARMASIS')) return 'PHARMACIST';
    if (r.includes('KINE') || r.includes('PHYSIO')) return 'PHYSIO';
    if (r.includes('LABORATORY') || r.includes('LAB')) return 'LAB';
    return 'PATIENT';
  }

  private canProfessionalAccess(role: string, categoryName: string): boolean {
    const map: { [key: string]: string[] } = {
      'DOCTOR': ['Ask a Doctor', 'General Health', 'Mental Health', 'Chronic Diseases', 'First Aid & Emergencies', 'Children Health', 'Women Health'],
      'PHARMACIST': ['Ask a Pharmacist', 'General Health', 'Medications & Side Effects', 'Nutrition & Diet'],
      'LAB': ['Ask a Lab', 'General Health', 'Chronic Diseases'],
      'PHYSIO': ['Ask a Physiotherapist', 'General Health', 'Fitness & Wellness', 'Healthy Lifestyle']
    };
    const allowed = map[role] || [];
    return allowed.includes(categoryName);
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
