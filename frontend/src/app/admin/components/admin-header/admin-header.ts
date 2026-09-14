import { CommonModule } from '@angular/common';
import {
  afterRenderEffect,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { catchError, EMPTY, filter } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { AdminService } from '../../../core/services/admin.service';
import { AdminTabService } from '../../../core/services/admin-tab.service';
import { ProfileService } from '../../../core/services/profile.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';

export interface AdminServiceItem {
  id: string;
  title: string;
  route: string;
  icon: string;
  bgColor: string;
}

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.css',
})
export class AdminHeader implements OnInit {
  private adminService = inject(AdminService);
  private profileService = inject(ProfileService);
  private snackBar = inject(SnackBarService);
  private router = inject(Router);
  tabService = inject(AdminTabService);
  private destroyRef = inject(DestroyRef);

  // States
  isMenuOpen = signal(false);
  isProfileOpen = signal(false);
  searchQuery = signal('');
  currentTitle = signal('Dashboard');

  adminName = signal('Admin');
  adminEmail = signal('');
  imageUrl = signal('');

  /** The horizontally scrolling tab strip, when a page has published tabs. */
  private tabStrip = viewChild<ElementRef<HTMLElement>>('tabStrip');
  canScrollLeft = signal(false);
  canScrollRight = signal(false);

  readonly services: AdminServiceItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboards',
      route: '/admin',
      icon: 'layout-dashboard',
      bgColor: 'bg-purple-600',
    },
    {
      id: 'profile',
      title: 'Profile & Bio',
      route: '/admin/profile',
      icon: 'users',
      bgColor: 'bg-blue-600',
    },
    {
      id: 'projects',
      title: 'Projects',
      route: '/admin/projects',
      icon: 'folder-kanban',
      bgColor: 'bg-teal-600',
    },
    {
      id: 'articles',
      title: 'Articles',
      route: '/admin/articles',
      icon: 'file-text',
      bgColor: 'bg-emerald-600',
    },
    {
      id: 'contacts',
      title: 'Inquiries',
      route: '/admin/contacts',
      icon: 'mail',
      bgColor: 'bg-fuchsia-600',
    },
    {
      id: 'faqs',
      title: 'FAQs',
      route: '/admin/faqs',
      icon: 'clipboard-list',
      bgColor: 'bg-amber-600',
    },
  ];

  filteredServices = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    return q ? this.services.filter((s) => s.title.toLowerCase().includes(q)) : this.services;
  });

  constructor() {
    // Stays here because afterRenderEffect needs an injection context. Tabs arrive
    // asynchronously (a page publishes them in its own ngOnInit) and the arrows
    // depend on measured widths, so re-measure after every render that changes them.
    afterRenderEffect(() => {
      this.tabService.tabs();
      this.updateTabScroll();
    });
  }

  ngOnInit(): void {
    this.updateTitleFromUrl(this.router.url);

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        this.updateTitleFromUrl(e.urlAfterRedirects || e.url);
        this.closeAllMenus();
      });

    // Two different profiles: the portfolio one owns the avatar, the admin account
    // owns the name/email. Either may fail without breaking the header.
    this.profileService
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => EMPTY))
      .subscribe((profile) => profile?.imageUrl && this.imageUrl.set(profile.imageUrl));

    this.adminService
      .getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => EMPTY))
      .subscribe(({ admin }: any) => {
        if (!admin?.name) return;

        this.adminName.set(admin.name);
        this.adminEmail.set(admin.email ?? '');
      });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (
      this.isMenuOpen() &&
      !target.closest('.waffle-btn') &&
      !target.closest('.services-drawer')
    ) {
      this.isMenuOpen.set(false);
      this.searchQuery.set('');
    }

    if (
      this.isProfileOpen() &&
      !target.closest('.profile-btn') &&
      !target.closest('.profile-dropdown')
    ) {
      this.isProfileOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllMenus();
  }

  @HostListener('window:resize')
  updateTabScroll(): void {
    const el = this.tabStrip()?.nativeElement;

    if (!el) {
      this.canScrollLeft.set(false);
      this.canScrollRight.set(false);
      return;
    }

    // 1px of slack — fractional scroll positions never settle exactly on the end.
    const maxScroll = el.scrollWidth - el.clientWidth;

    this.canScrollLeft.set(el.scrollLeft > 1);
    this.canScrollRight.set(el.scrollLeft < maxScroll - 1);
  }

  /** Pages the strip by most of a screenful, so a tap always reveals new tabs. */
  scrollTabs(direction: -1 | 1): void {
    const el = this.tabStrip()?.nativeElement;

    if (!el) return;

    el.scrollBy({ left: direction * Math.max(120, el.clientWidth * 0.7), behavior: 'smooth' });
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isMenuOpen.update((v) => !v);
    if (this.isMenuOpen()) {
      this.isProfileOpen.set(false);
      this.searchQuery.set('');
    }
  }

  toggleProfile(event: MouseEvent): void {
    event.stopPropagation();
    this.isProfileOpen.update((v) => !v);
    if (this.isProfileOpen()) {
      this.isMenuOpen.set(false);
    }
  }

  closeAllMenus(): void {
    this.isMenuOpen.set(false);
    this.isProfileOpen.set(false);
    this.searchQuery.set('');
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  isActive(route: string): boolean {
    const current = this.router.url;
    return route === '/admin'
      ? current === '/admin' || current === '/admin/dashboard'
      : current.startsWith(route);
  }

  navigateTo(route: string): void {
    this.closeAllMenus();
    this.router.navigateByUrl(route);
  }

  logout(): void {
    this.closeAllMenus();
    this.adminService.logout();
    this.router.navigate(['/admin/login']);
    this.snackBar.success('Admin Logout successful');
  }

  private updateTitleFromUrl(url: string): void {
    const path = url.split('?')[0];
    const match = this.services.find((s) => s.route !== '/admin' && path.includes(s.route));
    this.currentTitle.set(match ? match.title : 'Dashboard');
  }
}
