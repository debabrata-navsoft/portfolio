import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FAQApiResponse, FAQForm, FAQResponse, FAQSaveResponse } from '../../models/faq.model';

@Injectable({
  providedIn: 'root',
})
export class FaqService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/faqs`;

  createFAQ(data: FAQForm): Observable<FAQSaveResponse> {
    return this.http.post<FAQSaveResponse>(this.apiUrl, data);
  }

  // The API hides inactive FAQs unless `all=true` — admin screens need them too.
  getFAQs(includeInactive = false): Observable<FAQResponse[]> {
    const params = includeInactive ? { all: 'true' } : undefined;
    return this.http.get<FAQResponse[]>(this.apiUrl, { params });
  }

  getFAQById(id: string): Observable<FAQResponse> {
    return this.http.get<FAQResponse>(`${this.apiUrl}/${id}`);
  }

  updateFAQ(id: string, data: FAQForm): Observable<FAQSaveResponse> {
    return this.http.put<FAQSaveResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteFAQ(id: string): Observable<FAQApiResponse> {
    return this.http.delete<FAQApiResponse>(`${this.apiUrl}/${id}`);
  }
}
