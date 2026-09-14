import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AboutResponse, AboutSaveResponse } from '../../models/about.model';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/about`;

  saveAbout(data: FormData): Observable<AboutSaveResponse> {
    return this.http.post<AboutSaveResponse>(this.apiUrl, data);
  }

  getAbout(): Observable<AboutResponse> {
    return this.http.get<AboutResponse>(this.apiUrl);
  }
}
