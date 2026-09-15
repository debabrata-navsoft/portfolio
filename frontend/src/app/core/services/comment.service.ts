import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CommentApiResponse,
  CommentForm,
  CommentListResponse,
  CommentSaveResponse,
} from '../../models/comment.model';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comments`;

  getComments(article?: string): Observable<CommentListResponse> {
    const params = article ? new HttpParams().set('article', article) : undefined;
    return this.http.get<CommentListResponse>(this.apiUrl, { params });
  }

  createComment(comment: CommentForm): Observable<CommentSaveResponse> {
    return this.http.post<CommentSaveResponse>(this.apiUrl, comment);
  }

  updateComment(id: string, message: string): Observable<CommentSaveResponse> {
    return this.http.put<CommentSaveResponse>(`${this.apiUrl}/${id}`, { message });
  }

  deleteComment(id: string): Observable<CommentApiResponse> {
    return this.http.delete<CommentApiResponse>(`${this.apiUrl}/${id}`);
  }
}
