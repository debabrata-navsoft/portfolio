import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ProjectApiResponse,
  ProjectListFilters,
  ProjectListResponse,
  ProjectQuery,
  ProjectResponse,
  ProjectSaveResponse,
} from '../../models/project.model';
import { normalizeListResponse, toHttpParams } from '../../shared/filters/filter.utils';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/projects`;

  createProject(formData: FormData): Observable<ProjectSaveResponse> {
    return this.http.post<ProjectSaveResponse>(this.apiUrl, formData);
  }

  private activeParams = (activeOnly: boolean) => (activeOnly ? { active: 'true' } : undefined);

  getProjects(activeOnly = false): Observable<ProjectResponse[]> {
    return this.http
      .get<unknown>(this.apiUrl, { params: this.activeParams(activeOnly) })
      .pipe(map((res) => this.toListResponse(res).items));
  }

  queryProjects(query: ProjectQuery): Observable<ProjectListResponse> {
    return this.http
      .get<unknown>(this.apiUrl, { params: toHttpParams({ ...query }) })
      .pipe(map((res) => this.toListResponse(res, query)));
  }

  private toListResponse(res: unknown, query: ProjectQuery = {}): ProjectListResponse {
    return normalizeListResponse<ProjectResponse, ProjectListFilters>(
      res,
      { categories: [], technologies: [] },
      query.page ?? 1,
      query.limit ?? 0,
    );
  }

  getProjectBySlug(slug: string, activeOnly = false): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/${slug}`, {
      params: this.activeParams(activeOnly),
    });
  }

  updateProject(id: string, formData: FormData): Observable<ProjectSaveResponse> {
    return this.http.put<ProjectSaveResponse>(`${this.apiUrl}/${id}`, formData);
  }

  deleteProject(id: string): Observable<ProjectApiResponse> {
    return this.http.delete<ProjectApiResponse>(`${this.apiUrl}/${id}`);
  }
}
