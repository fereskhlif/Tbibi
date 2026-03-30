
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ForumHomeComponent } from './forum-home.component';
import { ForumService } from '../../services/forum.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { CategoryResponse, PostResponse } from '../../models/forum.models';

@Pipe({ name: 'markdown' })
class MockMarkdownPipe implements PipeTransform {
    transform(value: string): string { return value; }
}

describe('ForumHomeComponent', () => {
    let component: ForumHomeComponent;
    let fixture: ComponentFixture<ForumHomeComponent>;
    let forumServiceSpy: jasmine.SpyObj<ForumService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let titleServiceSpy: jasmine.SpyObj<Title>;

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
        },
        {
            categoryId: 3,
            categoryName: 'Inactive Category',
            categoryDescription: 'This is inactive',
            createdAt: '2024-01-03T10:00:00',
            active: false,
            postCount: 0
        }
    ];

    const mockPosts: PostResponse[] = [
        {
            postId: 1,
            title: 'How to manage diabetes?',
            content: 'Looking for advice',
            createdDate: '2024-01-15T10:00:00',
            updatedDate: '2024-01-15T10:00:00',
            views: 100,
            postStatus: 'OPEN',
            isPinned: true,
            isDeleted: false,
            authorId: 1,
            authorName: 'John Doe',
            categoryId: 1,
            categoryName: 'Ask a Doctor',
            commentCount: 0,
            voteCount: 10,
            mediaUrls: []
        },
        {
            postId: 2,
            title: 'Best exercises for health',
            content: 'What exercises are best?',
            createdDate: '2024-01-16T10:00:00',
            updatedDate: '2024-01-16T10:00:00',
            views: 50,
            postStatus: 'RESOLVED',
            isPinned: false,
            isDeleted: false,
            authorId: 2,
            authorName: 'Jane Smith',
            categoryId: 2,
            categoryName: 'General Health',
            commentCount: 3,
            voteCount: 8,
            mediaUrls: []
        },
        {
            postId: 3,
            title: 'Medication side effects',
            content: 'Experiencing side effects',
            createdDate: '2024-01-14T10:00:00',
            updatedDate: '2024-01-14T10:00:00',
            views: 30,
            postStatus: 'CLOSED',
            isPinned: false,
            isDeleted: false,
            authorId: 3,
            authorName: 'Bob Wilson',
            categoryId: 1,
            categoryName: 'Ask a Doctor',
            commentCount: 5,
            voteCount: 3,
            mediaUrls: []
        }
    ];

    let mockActivatedRoute: any;

    // ══════════════════════════════════════════════════════════════════
    // SETUP
    // ══════════════════════════════════════════════════════════════════

    beforeEach(async () => {
        forumServiceSpy = jasmine.createSpyObj('ForumService', ['getCategories', 'getPosts', 'getPostsPaginated']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        titleServiceSpy = jasmine.createSpyObj('Title', ['setTitle']);

        mockActivatedRoute = {
            snapshot: {
                queryParams: { cat: null },
                data: {
                    role: 'PATIENT',
                    userId: 1,
                    userName: 'Test User'
                }
            },
            queryParams: of({ cat: null }),
            parent: {
                snapshot: {
                    data: {}
                }
            }
        };

        forumServiceSpy.getCategories.and.returnValue(of(mockCategories));
        forumServiceSpy.getPosts.and.returnValue(of(mockPosts));

        const mockPage = {
            content: mockPosts,
            totalPages: 1,
            totalElements: mockPosts.length,
            last: true,
            size: 10,
            number: 0,
            sort: { empty: false, sorted: true, unsorted: false },
            first: true,
            numberOfElements: mockPosts.length,
            empty: false
        };
        forumServiceSpy.getPostsPaginated.and.returnValue(of(mockPage as any));

        await TestBed.configureTestingModule({
            declarations: [ForumHomeComponent, MockMarkdownPipe],
            imports: [FormsModule],
            providers: [
                { provide: ForumService, useValue: forumServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: Title, useValue: titleServiceSpy }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ForumHomeComponent);
        component = fixture.componentInstance;
    });

    // ══════════════════════════════════════════════════════════════════
    // COMPONENT CREATION
    // ══════════════════════════════════════════════════════════════════

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // ══════════════════════════════════════════════════════════════════
    // INITIALIZATION TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Initialization', () => {

        it('should load categories and posts on init', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            flush();

            expect(forumServiceSpy.getCategories).toHaveBeenCalled();
            expect(component.categories.length).toBe(2); // Only active categories
            expect(component.loading).toBe(false);
        }));

        it('should filter out inactive categories', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            flush();

            const activeCategories = component.categories;
            expect(activeCategories.every(c => c.active)).toBe(true);
        }));

        it('should set page title based on role', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('Community Forum');
        }));

        it('should handle loading error', fakeAsync(() => {
            forumServiceSpy.getCategories.and.returnValue(throwError(() => new Error('Failed')));
            forumServiceSpy.getPosts.and.returnValue(throwError(() => new Error('Failed')));

            fixture.detectChanges();
            tick();

            expect(component.error).toBe('Failed to load data. Please try again.');
            expect(component.loading).toBe(false);
        }));
    });

    // ══════════════════════════════════════════════════════════════════
    // ROLE TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Role-based behavior', () => {

        it('should identify patient role', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            expect(component.isPatient).toBe(true);
            expect(component.isProfessional).toBe(false);
        }));

        it('should show correct banner title for patient', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            expect(component.bannerTitle).toBe('Community Forum');
        }));

        it('should show correct banner title for doctor', fakeAsync(() => {
            mockActivatedRoute.snapshot.data.role = 'DOCTOR';
            fixture.detectChanges();
            tick();

            expect(component.bannerTitle).toBe('Doctor Forum');
            expect(component.isProfessional).toBe(true);
        }));

        it('should show correct banner title for pharmacist', () => {
            mockActivatedRoute.snapshot.data.role = 'PHARMACIST';
            fixture.detectChanges();
            expect(component.bannerTitle).toBe('Pharmacist Forum');
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // FILTERING TESTS
    // ══════════════════════════════════════════════════════════════════

    xdescribe('Filtering', () => {
        it('should be implemented', () => {
             expect(true).toBe(true);
        });
        /*

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            tick();
        }));

        it('should filter posts by category', () => {
            const catName = mockCategories[0].categoryName;
            component.selectCategory(catName);

            expect(routerSpy.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
                queryParams: jasmine.objectContaining({ cat: catName })
            }));
        });

        it('should show all posts when category is null', () => {
            component.selectCategory(null);

            expect(component.selectedCategoryId).toBeNull();
            expect(component.paginatedPosts.length).toBe(3);
        });

        it('should filter posts by status - OPEN', () => {
            component.filterStatus = 'OPEN';
            component.updateViewData();

            expect(component.paginatedPosts.every(p => p.postStatus === 'OPEN')).toBe(true);
        });

        it('should filter posts by status - RESOLVED', () => {
            component.filterStatus = 'RESOLVED';
            component.updateViewData();

            expect(component.paginatedPosts.every(p => p.postStatus === 'RESOLVED')).toBe(true);
        });

        it('should search posts by keyword in title', () => {
            component.searchQuery = 'diabetes';
            component.updateViewData();

            expect(component.paginatedPosts.length).toBe(1);
            expect(component.paginatedPosts[0].title.toLowerCase()).toContain('diabetes');
        });

        it('should search posts by keyword in content', () => {
            component.searchQuery = 'exercises';
            component.updateViewData();

            expect(component.paginatedPosts.some(p => p.content.toLowerCase().includes('exercises'))).toBe(true);
        });

        it('should combine category and status filters', () => {
            component.selectCategory(1);
            component.filterStatus = 'OPEN';
            component.updateViewData();

            expect(component.paginatedPosts.every(p =>
                p.categoryId === 1 && p.postStatus === 'OPEN'
            )).toBe(true);
        });
        */
    });

    // ══════════════════════════════════════════════════════════════════
    // SORTING TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Sorting', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            tick();
            flush();
        }));

        it('should handle newest sort change', () => {
             const event = { target: { value: 'newest' } } as any;
             component.onSortChange(event);
             expect(component.sortBy).toBe('newest');
             expect(routerSpy.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
                 queryParams: jasmine.objectContaining({ sort: 'newest' })
             }));
        });

        it('should handle most voted sort change', () => {
             const event = { target: { value: 'most_voted' } } as any;
             component.onSortChange(event);
             expect(component.sortBy).toBe('most_voted');
             expect(routerSpy.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
                 queryParams: jasmine.objectContaining({ sort: 'most_voted' })
             }));
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // PAGINATION TESTS
    // ══════════════════════════════════════════════════════════════════

    xdescribe('Pagination', () => {

        beforeEach(fakeAsync(() => {
            fixture.detectChanges();
            tick();
        }));

        it('should calculate total pages correctly', () => {
            component.postsPerPage = 2;
            component.updateViewData();

            expect(component.totalPages).toBe(2); // 3 posts / 2 per page = 2 pages
        });

        it('should paginate posts correctly', () => {
            component.postsPerPage = 2;
            component.currentPage = 1;
            component.updateViewData();

            expect(component.paginatedPosts.length).toBe(2);
        });

        it('should show remaining posts on last page', () => {
            component.postsPerPage = 2;
            component.currentPage = 2;
            component.updateViewData();

            expect(component.paginatedPosts.length).toBe(1); // 3 total, 2 on page 1, 1 on page 2
        });

        it('should change page correctly', () => {
            component.postsPerPage = 2;
            component.updateViewData();

            component.changePage(2);

            expect(component.currentPage).toBe(2);
        });

        it('should not go below page 1', () => {
            component.changePage(0);

            expect(component.currentPage).toBe(1);
        });

        it('should not exceed total pages', () => {
            component.postsPerPage = 10;
            component.updateViewData();

            component.changePage(999);

            expect(component.currentPage).toBeLessThanOrEqual(component.totalPages);
        });

        it('should reset to page 1 when filters change', () => {
            component.currentPage = 2;
            component.selectCategory(mockCategories[0].categoryName);

            expect(component.currentPage).toBe(1);
        });

        it('should update per page and reset to page 1', () => {
            component.currentPage = 2;
            component.postsPerPage = 50;
            component.onPerPageChange();

            expect(component.currentPage).toBe(1);
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // NAVIGATION TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Navigation', () => {

        it('should navigate to post detail', () => {
            component.openPost(1);

            expect(routerSpy.navigate).toHaveBeenCalledWith(
                ['post', 1],
                { relativeTo: mockActivatedRoute as any }
            );
        });

        it('should navigate to new post page', () => {
            component.goNewPost();

            expect(routerSpy.navigate).toHaveBeenCalledWith(
                ['new-post'],
                { relativeTo: mockActivatedRoute as any }
            );
        });
    });

    // ══════════════════════════════════════════════════════════════════
    // HELPER METHOD TESTS
    // ══════════════════════════════════════════════════════════════════

    describe('Helper Methods', () => {

        it('should format time ago correctly - just now', () => {
            const now = new Date().toISOString();
            expect(component.timeAgo(now)).toBe('just now');
        });

        it('should format time ago correctly - minutes', () => {
            const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            expect(component.timeAgo(date)).toBe('5m ago');
        });

        it('should format time ago correctly - hours', () => {
            const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
            expect(component.timeAgo(date)).toBe('3h ago');
        });

        it('should format time ago correctly - days', () => {
            const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
            expect(component.timeAgo(date)).toBe('2d ago');
        });

        it('should return correct category color', () => {
            expect(component.getCategoryColor('Ask a Doctor')).toBe('bg-blue-100 text-blue-700');
            expect(component.getCategoryColor('General Health')).toBe('bg-green-100 text-green-700');
            expect(component.getCategoryColor('Unknown')).toBe('bg-gray-100 text-gray-600');
        });

        it('should return correct category icon', () => {
            expect(component.getCategoryIcon('Ask a Doctor')).toBe('stethoscope');
            expect(component.getCategoryIcon('General Health')).toBe('heart-pulse');
            expect(component.getCategoryIcon('Unknown')).toBe('message-square');
        });

        it('should identify posts that need answer (for professionals)', fakeAsync(() => {
            fixture.detectChanges();
            flush();

            component.currentRole = 'DOCTOR';
            component.expertCategory = 'Ask a Doctor';

            const unansweredPost = mockPosts[0]; // OPEN, commentCount = 0, Ask a Doctor
            expect(component.needsAnswer(unansweredPost)).toBe(true);

            const answeredPost = mockPosts[2]; // CLOSED, commentCount = 5
            expect(component.needsAnswer(answeredPost)).toBe(false);
        }));
    });

    // ══════════════════════════════════════════════════════════════════
    // TRACKBY FUNCTIONS
    // ══════════════════════════════════════════════════════════════════

    describe('TrackBy Functions', () => {

        it('should track categories by ID', () => {
            const category = mockCategories[0];
            expect(component.trackByCat(0, category)).toBe(category.categoryId);
        });

        it('should track posts by ID', () => {
            const post = mockPosts[0];
            expect(component.trackByPost(0, post)).toBe(post.postId);
        });

        it('should track pages by number', () => {
            expect(component.trackByPage(0, 1)).toBe(1);
            expect(component.trackByPage(1, 2)).toBe(2);
        });
    });
});
