import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('adminToken');

  // decode JWT manually
  const decodeToken = (token: string): any | null => {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  };

  const isTokenExpired = (token: string): boolean => {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;

    // exp is in seconds → convert to ms
    return decoded.exp * 1000 < Date.now();
  };

  // LOGIN PAGE LOGIC
  if (state.url === '/admin/login') {
    if (token && !isTokenExpired(token)) {
      return router.createUrlTree(['/admin/dashboard']);
    }
    return true;
  }

  // PROTECTED ROUTES
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('adminToken');
    return router.createUrlTree(['/admin/login']);
  }

  return true;
};
