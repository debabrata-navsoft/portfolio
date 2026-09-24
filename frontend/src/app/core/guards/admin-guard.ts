import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { isTokenExpired } from '../../utils/jwt.utils';

export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('adminToken');

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
