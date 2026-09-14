import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SkillApiResponse, SkillResponse, SkillSaveResponse } from '../../models/skills.model';

@Injectable({
  providedIn: 'root',
})
export class SkillsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/skills`;

  getSkills(): Observable<SkillResponse[]> {
    return this.http.get<SkillResponse[]>(this.apiUrl);
  }

  createSkill(data: FormData): Observable<SkillSaveResponse> {
    return this.http.post<SkillSaveResponse>(this.apiUrl, data);
  }

  updateSkill(id: string, data: FormData): Observable<SkillSaveResponse> {
    return this.http.put<SkillSaveResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteSkill(id: string): Observable<SkillApiResponse> {
    return this.http.delete<SkillApiResponse>(`${this.apiUrl}/${id}`);
  }
}
