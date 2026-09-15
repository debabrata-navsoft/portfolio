/** A comment as returned by the API. Replies are nested one level deep. */
export interface CommentResponse {
  _id: string;
  article: string | { _id: string; title: string; slug: string };
  parent: string | null;
  name: string;
  email: string;
  message: string;
  isAuthor: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: CommentResponse[];
}

export interface CommentListResponse {
  items: CommentResponse[];
  total: number;
}

export interface CommentForm {
  article: string;
  name: string;
  email?: string;
  message: string;
  parent?: string | null;
  isAuthor?: boolean;
}

export interface CommentSaveResponse {
  message: string;
  comment: CommentResponse;
}

export interface CommentApiResponse {
  message: string;
}
