import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ExperienceApiResponse,
  ExperienceForm,
  ExperienceResponse,
  ExperienceSaveResponse,
} from '../../models/experience.model';

@Injectable({
  providedIn: 'root',
})
export class ExperienceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/experiences`;

  createExperience(data: ExperienceForm): Observable<ExperienceSaveResponse> {
    return this.http.post<ExperienceSaveResponse>(this.apiUrl, data);
  }

  getExperiences(): Observable<ExperienceResponse[]> {
    return this.http.get<ExperienceResponse[]>(this.apiUrl);
  }

  updateExperience(id: string, data: ExperienceForm): Observable<ExperienceSaveResponse> {
    return this.http.put<ExperienceSaveResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteExperience(id: string): Observable<ExperienceApiResponse> {
    return this.http.delete<ExperienceApiResponse>(`${this.apiUrl}/${id}`);
  }
}
