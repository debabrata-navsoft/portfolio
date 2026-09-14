import { Component, DestroyRef, HostListener, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs';

import { NAVBAR_MENU } from '../../../portfolio-data';
import { NavbarMenu } from '../../../models/navbar.model';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private router = inject(Router);
  private loaderService = inject(LoaderService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

  isScrolled = false;
  isOpen = false;
  isDark = false;
  activeSection = 'home';

  navbarMenu = NAVBAR_MENU;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedTheme = localStorage.getItem('theme');

    this.isDark = savedTheme === 'dark';

    document.documentElement.classList.toggle('dark-theme', this.isDark);

    // document.documentElement.classList.remove('dark-theme');

    this.setActiveMenuByUrl(this.router.url);

    const routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.setActiveMenuByUrl(event.urlAfterRedirects);
      });

    this.destroyRef.onDestroy(() => {
      routerSub.unsubscribe();
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isScrolled = window.scrollY > 50;

    if (this.isOpen) {
      this.isOpen = false;
    }
  }

  setActiveMenuByUrl(url: string) {
    const matched = this.navbarMenu.find((item) => url === item.link || url.startsWith(item.link));

    this.activeSection = matched?.id ?? 'home';
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  handleNavigation(item: NavbarMenu) {
    this.isOpen = false;

    const [path, fragment] = item.link.split('#');
    const targetPath = path || '/';
    const currentPath = this.router.url.split('#')[0];

    // Section navigation (About / Services)
    if (fragment) {
      if (currentPath !== targetPath) {
        this.loaderService.showStartup();

        this.router.navigateByUrl(targetPath).then(() => {
          this.scrollToFragment(fragment);
        });

        return;
      }

      this.scrollToFragment(fragment);
      return;
    }

    // Normal route navigation
    this.router.navigateByUrl(item.link);
  }

  // handleNavigation(item: NavbarMenu) {
  //   this.isOpen = false;

  //   const [path, fragment] = item.link.split('#');
  //   const targetPath = path || '/';

  //   if (!fragment) {
  //     this.router.navigateByUrl(item.link);
  //     return;
  //   }

  //   const currentPath = this.router.url.split('#')[0];

  //   if (currentPath === targetPath) {
  //     this.scrollToFragment(fragment);
  //     return;
  //   }

  //   this.router.navigateByUrl(targetPath).then(() => {
  //     this.scrollToFragment(fragment);
  //   });
  // }

  // private scrollToFragment(fragment: string, attempt = 0) {
  //   if (!isPlatformBrowser(this.platformId)) return;

  //   const el = document.getElementById(fragment);

  //   if (el) {
  //     const navbarHeight = 130;

  //     const y = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

  //     window.scrollTo({
  //       top: y,
  //       behavior: 'smooth',
  //     });

  //     return;
  //   }

  //   if (attempt < 20) {
  //     setTimeout(() => this.scrollToFragment(fragment, attempt + 1), 50);
  //   }
  // }

  private scrollToFragment(fragment: string, attempt = 0) {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = document.getElementById(fragment);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (attempt < 20) {
      setTimeout(() => this.scrollToFragment(fragment, attempt + 1), 50);
    }
  }

  toggleTheme() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isDark = !this.isDark;

    document.documentElement.classList.toggle('dark-theme', this.isDark);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  getActiveLiClass(id: string): string {
    if (this.activeSection !== id) return '';
    return this.isDark ? '!text-gray-500' : '!text-gray-500';
  }

  goHome() {
    this.isOpen = false;

    if (this.router.url !== '/') {
      this.loaderService.showStartup();
    }

    this.router.navigate(['/']);
  }
}
