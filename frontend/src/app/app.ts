import { Component, inject, NgZone, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';

import { isPlatformBrowser, NgClass } from '@angular/common';
import { AdminService } from './core/services/admin.service';
import { LoaderService } from './core/services/loader.service';
import { filter } from 'rxjs';
import { ApiLoader } from './shared/components/loaders/api-loader/api-loader';
import { StartupLoader } from './shared/components/loaders/startup-loader/startup-loader';
import { ConfirmDialog } from './shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, NgClass, ApiLoader, StartupLoader, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private router = inject(Router);
  private adminService = inject(AdminService);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  loaderService = inject(LoaderService);
  isAdminPage = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loaderService.initStartupLoader();
      this.isAdminPage.set(window.location.pathname.startsWith('/admin'));

      // this.adminService.scheduleAutoLogout(this.adminService.getToken());
      this.ngZone.runOutsideAngular(() => {
        this.adminService.scheduleAutoLogout(this.adminService.getToken());
      });
    }

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAdminPage.set(event.urlAfterRedirects.startsWith('/admin'));
      });
  }
}
