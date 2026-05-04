import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import {
  CategoryResponse,
  PostResponse,
  CommentResponse,
  VoteResponse,
  CreatePostRequest,
  CreateCommentRequest,
  VoteRequest,
  Page
} from '../models/forum.models';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private apiUrl = `${environment.baseUrl}/api/forum`;

  constructor(private http: HttpClient) { }

  // ─── Categories ──────────────────────────────────────────────────────────────
  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.apiUrl}/categories`);
  }

  // ─── Posts ───────────────────────────────────────────────────────────────────
  getPosts(): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/posts`);
  }

  getPostsByCategory(categoryId: number): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/posts/category/${categoryId}`);
  }

  getPostsByAuthor(authorId: number): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/posts/author/${authorId}`);
  }

  getPostById(id: number, userId?: number): Observable<PostResponse> {
    const params: any = {};
    if (userId && userId > 0) params.userId = userId;
    return this.http.get<PostResponse>(`${this.apiUrl}/posts/${id}`, { params });
  }

  searchPosts(keyword: string): Observable<PostResponse[]> {
    return this.http.get<PostResponse[]>(`${this.apiUrl}/posts/search`, { params: { keyword } });
  }

  getPostsPaginated(page: number, size: number, status?: string, sortBy?: string, categoryIds?: number[]): Observable<Page<PostResponse>> {
    const params: any = { page, size };
    if (status) params.status = status;
    if (sortBy) params.sortBy = sortBy;
    if (categoryIds && categoryIds.length > 0) params.categoryIds = categoryIds.join(',');
    return this.http.get<Page<PostResponse>>(`${this.apiUrl}/posts/paginated`, { params });
  }

  getPostsByCategoryPaginated(categoryId: number, page: number, size: number, status?: string, sortBy?: string): Observable<Page<PostResponse>> {
    const params: any = { page, size };
    if (status) params.status = status;
    if (sortBy) params.sortBy = sortBy;
    return this.http.get<Page<PostResponse>>(`${this.apiUrl}/posts/category/${categoryId}/paginated`, { params });
  }

  searchPostsPaginated(keyword: string, page: number, size: number, status?: string, sortBy?: string, categoryIds?: number[]): Observable<Page<PostResponse>> {
    const params: any = { keyword, page, size };
    if (status) params.status = status;
    if (sortBy) params.sortBy = sortBy;
    if (categoryIds && categoryIds.length > 0) params.categoryIds = categoryIds.join(',');
    return this.http.get<Page<PostResponse>>(`${this.apiUrl}/posts/search/paginated`, { params });
  }

  getCategoryStats(categoryId: number): Observable<{ totalPosts: number, unansweredCount: number }> {
    return this.http.get<{ totalPosts: number, unansweredCount: number }>(`${this.apiUrl}/posts/category/${categoryId}/stats`);
  }

  createPost(request: CreatePostRequest): Observable<PostResponse> {
    return this.http.post<PostResponse>(`${this.apiUrl}/posts`, request);
  }

  updatePostStatus(id: number, status: string): Observable<PostResponse> {
    return this.http.put<PostResponse>(`${this.apiUrl}/posts/${id}/status`, null, { params: { status } });
  }

  updatePost(id: number, request: CreatePostRequest): Observable<PostResponse> {
    return this.http.put<PostResponse>(`${this.apiUrl}/posts/${id}`, request);
  }

  uploadPostMedia(postId: number, files: File[]): Observable<PostResponse> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<PostResponse>(
      `${this.apiUrl}/posts/${postId}/media`,
      formData
    );
  }

  togglePin(id: number): Observable<PostResponse> {
    return this.http.put<PostResponse>(`${this.apiUrl}/posts/${id}/pin`, null);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`);
  }

  // ─── Comments ────────────────────────────────────────────────────────────────
  getCommentsByPost(postId: number): Observable<CommentResponse[]> {
    return this.http.get<CommentResponse[]>(`${this.apiUrl}/comments/post/${postId}`);
  }

  createComment(request: CreateCommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`${this.apiUrl}/comments`, request);
  }

  updateComment(id: number, comment: string): Observable<CommentResponse> {
    return this.http.put<CommentResponse>(`${this.apiUrl}/comments/${id}`, null, { params: { comment } });
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${id}`);
  }

  togglePinComment(commentId: number, userId: number): Observable<CommentResponse> {
    return this.http.put<CommentResponse>(`${this.apiUrl}/comments/${commentId}/pin`, null, {
      params: { userId: userId.toString() }
    });
  }

  // ─── Votes ───────────────────────────────────────────────────────────────────
  vote(request: VoteRequest): Observable<VoteResponse> {
    return this.http.post<VoteResponse>(`${this.apiUrl}/votes`, request);
  }

  unvote(userId: number, postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/votes`, { params: { userId, postId } });
  }

  getVoteCount(postId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/votes/count/${postId}`);
  }

  checkVote(userId: number, postId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/votes/check`, { params: { userId, postId } });
  }

  voteComment(userId: number, commentId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/comments/votes`, { userId, commentId });
  }

  unvoteComment(userId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/votes`, { params: { userId, commentId } });
  }

  getUserVotedComments(userId: number, postId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/posts/${postId}/voted-comments`, { params: { userId } });
  }

  // ─── Related Posts ──────────────────────────────────────────────────────────
  getRelatedPosts(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${postId}/related`);
  }

  // ─── AI Summarization ───────────────────────────────────────────────────────
  summarizePost(postId: number): Observable<string> {
    return this.http.get(`${this.apiUrl}/summarize-thread/${postId}`, { responseType: 'text' });
  }

  getSummaryStreamUrl(postId: number): string {
    return `${this.apiUrl}/summarize-thread-stream/${postId}`;
  }
}
