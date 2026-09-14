import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ArticleApiResponse,
  ArticleListFilters,
  ArticleListResponse,
  ArticleQuery,
  ArticleResponse,
  ArticleSaveResponse,
} from '../../models/article.model';
import { normalizeListResponse, toHttpParams } from '../../shared/filters/filter.utils';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/articles`;

  createArticle(formData: FormData): Observable<ArticleSaveResponse> {
    return this.http.post<ArticleSaveResponse>(this.apiUrl, formData);
  }

  /** Every article, for callers that don't search / filter / paginate. */
  getArticles(): Observable<ArticleResponse[]> {
    return this.http.get<unknown>(this.apiUrl).pipe(map((res) => this.toListResponse(res).items));
  }

  /** Server-side search, filter, count and pagination + the filter facets. */
  queryArticles(query: ArticleQuery): Observable<ArticleListResponse> {
    return this.http
      .get<unknown>(this.apiUrl, { params: toHttpParams({ ...query }) })
      .pipe(map((res) => this.toListResponse(res, query)));
  }

  private toListResponse(res: unknown, query: ArticleQuery = {}): ArticleListResponse {
    return normalizeListResponse<ArticleResponse, ArticleListFilters>(
      res,
      { tags: [], readingTimes: [] },
      query.page ?? 1,
      query.limit ?? 0,
    );
  }

  getArticleBySlug(slug: string): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${this.apiUrl}/${slug}`);
  }

  updateArticle(id: string, formData: FormData): Observable<ArticleSaveResponse> {
    return this.http.put<ArticleSaveResponse>(`${this.apiUrl}/${id}`, formData);
  }

  deleteArticle(id: string): Observable<ArticleApiResponse> {
    return this.http.delete<ArticleApiResponse>(`${this.apiUrl}/${id}`);
  }
}
