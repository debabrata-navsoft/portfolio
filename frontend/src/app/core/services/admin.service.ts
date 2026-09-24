import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../models/admin.model';
import { decodeToken } from '../../utils/jwt.utils';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  private api = `${environment.apiUrl}/admin`;
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.api}/login`, {
      email,
      password,
    });
  }

  logout() {
    this.clearAutoLogoutTimer();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('adminToken');
    }
    return this.http.post(`${this.api}/logout`, {});
  }

  getProfile() {
    return this.http.get(`${this.api}/profile`);
  }

  saveToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('adminToken', token);
      this.scheduleAutoLogout(token);
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('adminToken');
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  // Call this once when the app boots (if a token exists) and every time a new token is saved.
  scheduleAutoLogout(token: string | null) {
    this.clearAutoLogoutTimer();

    if (!isPlatformBrowser(this.platformId) || !token) {
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded?.exp) {
      return;
    }

    const msUntilExpiry = decoded.exp * 1000 - Date.now();

    if (msUntilExpiry <= 0) {
      this.forceLogout();
      return;
    }

    // setTimeout max delay is ~24.8 days; fine for typical short-lived JWTs.
    this.expiryTimer = setTimeout(() => this.forceLogout(), msUntilExpiry);
  }

  clearAutoLogoutTimer() {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private forceLogout() {
    this.clearAutoLogoutTimer();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('adminToken');
    }
    this.router.navigate(['/admin/login']);
  }
}
