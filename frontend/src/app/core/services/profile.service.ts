import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ProfileForm,
  ProfileImageResponse,
  ProfileResponse,
  ProfileSaveResponse,
  ResumeResponse,
} from '../../models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/profile`;

  uploadProfileImage(file: File): Observable<ProfileImageResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<ProfileImageResponse>(`${this.apiUrl}/image`, formData);
  }

  updateProfileContent(data: ProfileForm): Observable<ProfileSaveResponse> {
    return this.http.put<ProfileSaveResponse>(this.apiUrl, data);
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(this.apiUrl);
  }

  saveResumeUrl(resumeUrl: string): Observable<ResumeResponse> {
    return this.http.post<ResumeResponse>(`${this.apiUrl}/resume`, {
      resumeUrl,
    });
  }

  getResumeUrl(): Observable<ResumeResponse> {
    return this.http.get<ResumeResponse>(`${this.apiUrl}/resume`);
  }
}
