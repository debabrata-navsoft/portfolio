import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ArticleApiResponse,
  ArticleLikeResponse,
  ArticleListFilters,
  ArticleListResponse,
  ArticleQuery,
  ArticleResponse,
  ArticleSaveResponse,
  ArticleStatsResponse,
  ArticleViewResponse,
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

  /**
   * Public callers pass `publishedOnly` so drafts stay hidden even from the signed-in admin
   * (the API hides them from everyone else regardless).
   */
  private publishedParams = (publishedOnly: boolean) =>
    publishedOnly ? { published: 'true' } : undefined;

  /** Every article, for callers that don't search / filter / paginate. */
  getArticles(publishedOnly = false): Observable<ArticleResponse[]> {
    return this.http
      .get<unknown>(this.apiUrl, { params: this.publishedParams(publishedOnly) })
      .pipe(map((res) => this.toListResponse(res).items));
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

  getArticleBySlug(slug: string, publishedOnly = false): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${this.apiUrl}/${slug}`, {
      params: this.publishedParams(publishedOnly),
    });
  }

  registerView(slug: string): Observable<ArticleViewResponse> {
    return this.http.post<ArticleViewResponse>(`${this.apiUrl}/${slug}/view`, {});
  }

  toggleLike(slug: string, liked: boolean): Observable<ArticleLikeResponse> {
    return this.http.post<ArticleLikeResponse>(`${this.apiUrl}/${slug}/like`, { liked });
  }

  resetStats(slug: string): Observable<ArticleStatsResponse> {
    return this.http.post<ArticleStatsResponse>(`${this.apiUrl}/${slug}/reset-stats`, {});
  }

  updateArticle(id: string, formData: FormData): Observable<ArticleSaveResponse> {
    return this.http.put<ArticleSaveResponse>(`${this.apiUrl}/${id}`, formData);
  }

  deleteArticle(id: string): Observable<ArticleApiResponse> {
    return this.http.delete<ArticleApiResponse>(`${this.apiUrl}/${id}`);
  }
}
