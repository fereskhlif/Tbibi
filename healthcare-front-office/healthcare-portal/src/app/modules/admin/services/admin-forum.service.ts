import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminForumService {
  private readonly baseUrl = 'http://localhost:8088';

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/forum/stats`, { withCredentials: true });
  }

  getPosts(verdict: string = 'ALL'): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/forum/posts?verdict=${verdict}`, { withCredentials: true });
  }

  getComments(postId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/forum/posts/${postId}/comments`, { withCredentials: true });
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/forum/posts/${postId}`, { withCredentials: true });
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/forum/comments/${commentId}`, { withCredentials: true });
  }

  deleteComments(commentIds: number[]): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/forum/comments`, { body: commentIds, withCredentials: true });
  }
}
