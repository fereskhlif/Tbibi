export type PostStatus = 'OPEN' | 'CLOSED' | 'RESOLVED';

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  categoryDescription: string;
  createdAt: string;
  active: boolean;
  postCount: number;
}

export interface PostResponse {
  postId: number;
  title: string;
  content: string;
  createdDate: string;
  updatedDate: string;
  views: number;
  postStatus: PostStatus;
  isPinned: boolean;
  isDeleted: boolean;
  authorId: number;
  authorName: string;
  categoryId: number;
  categoryName: string;
  commentCount: number;
  voteCount: number;
  mediaUrls: string[];
}

export interface CommentResponse {
  commentId: number;
  comment: string;
  commentDate: string;
  updatedDate: string;
  isDeleted: boolean;
  authorId: number;
  authorName: string;
  postId: number;
  parentCommentId: number | null;
  replies: CommentResponse[];
}

export interface VoteResponse {
  voteId: number;
  userId: number;
  userName: string;
  postId: number;
  createdAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  categoryId: number;
  authorId: number;
}

export interface CreateCommentRequest {
  comment: string;
  authorId: number;
  postId: number;
  parentCommentId?: number | null;
}

export interface VoteRequest {
  userId: number;
  postId: number;
}
