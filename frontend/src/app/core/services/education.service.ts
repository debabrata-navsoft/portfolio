import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  EducationApiResponse,
  EducationForm,
  EducationResponse,
  EducationSaveResponse,
} from '../../models/education.model';

@Injectable({
  providedIn: 'root',
})
export class EducationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/educations`;

  createEducation(data: EducationForm): Observable<EducationSaveResponse> {
    return this.http.post<EducationSaveResponse>(this.apiUrl, data);
  }

  getEducation(): Observable<EducationResponse[]> {
    return this.http.get<EducationResponse[]>(this.apiUrl);
  }

  updateEducation(id: string, data: EducationForm): Observable<EducationSaveResponse> {
    return this.http.put<EducationSaveResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteEducation(id: string): Observable<EducationApiResponse> {
    return this.http.delete<EducationApiResponse>(`${this.apiUrl}/${id}`);
  }
}
