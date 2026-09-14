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

  getFAQs(): Observable<FAQResponse[]> {
    return this.http.get<FAQResponse[]>(this.apiUrl);
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
