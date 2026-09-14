import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  ContactApiResponse,
  ContactForm,
  ContactResponse,
  ContactSaveResponse,
} from '../../models/contact.model';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/contacts`;

  createContact(data: ContactForm): Observable<ContactSaveResponse> {
    return this.http.post<ContactSaveResponse>(this.apiUrl, data);
  }

  getContacts(): Observable<ContactResponse[]> {
    return this.http.get<ContactResponse[]>(this.apiUrl);
  }

  getContactById(id: string): Observable<ContactResponse> {
    return this.http.get<ContactResponse>(`${this.apiUrl}/${id}`);
  }

  markAsRead(id: string): Observable<ContactSaveResponse> {
    return this.http.patch<ContactSaveResponse>(`${this.apiUrl}/${id}/read`, {});
  }

  deleteContact(id: string): Observable<ContactApiResponse> {
    return this.http.delete<ContactApiResponse>(`${this.apiUrl}/${id}`);
  }
}
