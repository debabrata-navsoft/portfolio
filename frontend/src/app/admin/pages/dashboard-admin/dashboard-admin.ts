import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { ProjectService } from '../../../core/services/project.service';
import { ArticleService } from '../../../core/services/article.service';
import { ContactService } from '../../../core/services/contact.service';
import { SkillsService } from '../../../core/services/skills.service';
import { ExperienceService } from '../../../core/services/experience.service';
import { EducationService } from '../../../core/services/education.service';
import { FaqService } from '../../../core/services/faq.service';
import { ProfileService } from '../../../core/services/profile.service';
import { AdminService } from '../../../core/services/admin.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { LoaderService } from '../../../core/services/loader.service';

import { ProjectResponse } from '../../../models/project.model';
import { ArticleResponse } from '../../../models/article.model';
import { ContactResponse } from '../../../models/contact.model';
import { SkillResponse } from '../../../models/skills.model';
import { ExperienceResponse } from '../../../models/experience.model';
import { EducationResponse } from '../../../models/education.model';
import { FAQResponse } from '../../../models/faq.model';
import { ProfileResponse } from '../../../models/profile.model';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { Error } from '../../../shared/components/error/error';

interface CategoryMetric {
  name: string;
  count: number;
  percentage: number;
  colorClass: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  link: string;
}

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, TimeAgoPipe, LucideAngularModule, Error],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
})
export class DashboardAdmin implements OnInit {
  private projectService = inject(ProjectService);
  private articleService = inject(ArticleService);
  private contactService = inject(ContactService);
  private skillsService = inject(SkillsService);
  private experienceService = inject(ExperienceService);
  private educationService = inject(EducationService);
  private faqService = inject(FaqService);
  private profileService = inject(ProfileService);
  private adminService = inject(AdminService);
  private snackBar = inject(SnackBarService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  // States
  isRefreshing = signal(false);
  isErrorMsg = signal(false);

  /** Sources that failed in the current load — see `guard()`. */
  private failedRequests = 0;
  private readonly requestCount = 9;

  adminName = signal('Admin');
  adminEmail = signal('');

  // Primary datasets
  projects = signal<ProjectResponse[]>([]);
  articles = signal<ArticleResponse[]>([]);
  contacts = signal<ContactResponse[]>([]);
  skills = signal<SkillResponse[]>([]);
  experiences = signal<ExperienceResponse[]>([]);
  education = signal<EducationResponse[]>([]);
  faqs = signal<FAQResponse[]>([]);
  profile = signal<ProfileResponse | null>(null);

  // Computed KPI stats
  totalProjects = computed(() => this.projects().length);
  totalArticles = computed(() => this.articles().length);
  publishedArticlesCount = computed(() => this.articles().filter((a) => a.published).length);
  totalContacts = computed(() => this.contacts().length);
  unreadContactsCount = computed(() => this.contacts().filter((c) => !c.isRead).length);
  totalSkills = computed(() => this.skills().length);
  uniqueSkillCategoriesCount = computed(
    () =>
      new Set(
        this.skills()
          .map((s) => s.category)
          .filter(Boolean),
      ).size,
  );
  totalExperiences = computed(() => this.experiences().length);
  totalEducation = computed(() => this.education().length);
  totalFaqs = computed(() => this.faqs().length);
  activeFaqsCount = computed(() => this.faqs().filter((f) => f.isActive).length);

  // Feeds
  recentContacts = computed(() => this.contacts().slice(0, 4));
  recentProjects = computed(() => this.projects().slice(0, 3));
  recentArticles = computed(() => this.articles().slice(0, 3));

  // Category distribution
  categoryDistribution = computed<CategoryMetric[]>(() => {
    const projs = this.projects();
    if (!projs.length) return [];

    const counts: Record<string, number> = {};
    for (const p of projs) {
      const cat = p.category?.trim() || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    }

    const colors = [
      'bg-indigo-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-sky-500',
      'bg-violet-500',
    ];
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({
        name,
        count,
        percentage: Math.round((count / projs.length) * 100),
        colorClass: colors[idx % colors.length],
      }));
  });

  // Portfolio Health checklist
  checklistItems = computed<ChecklistItem[]>(() => {
    const prof = this.profile();
    return [
      {
        id: 'hero',
        label: 'Hero & Heading',
        description: 'Set your hero gradient text and main headline',
        isComplete: !!(prof?.heroHeading && prof?.heroGradientText),
        link: '/admin/profile',
      },
      {
        id: 'bio',
        label: 'Introduction & Bio',
        description: 'Provide an overview of your background',
        isComplete: !!(prof?.introduction || prof?.profileDescription),
        link: '/admin/profile',
      },
      {
        id: 'image',
        label: 'Profile Picture',
        description: 'Upload an avatar or headshot',
        isComplete: !!prof?.imageUrl,
        link: '/admin/profile',
      },
      {
        id: 'projects',
        label: 'Featured Projects',
        description: 'Add your portfolio projects and live links',
        isComplete: this.projects().length > 0,
        link: '/admin/projects',
      },
      {
        id: 'skills',
        label: 'Skills Stack',
        description: 'Showcase your core frontend and backend skills',
        isComplete: this.skills().length >= 3,
        link: '/admin/profile',
      },
      {
        id: 'faqs',
        label: 'Client FAQs',
        description: 'Add frequently asked questions for visitors',
        isComplete: this.faqs().length > 0,
        link: '/admin/faqs',
      },
    ];
  });

  portfolioHealthScore = computed(() => {
    const items = this.checklistItems();
    return items.length
      ? Math.round((items.filter((i) => i.isComplete).length / items.length) * 100)
      : 0;
  });

  get dynamicGreeting(): string {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  }

  get currentDateFormatted(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(isRefresh = false): void {
    if (isRefresh && this.isRefreshing()) return;

    if (isRefresh) this.isRefreshing.set(true);

    this.loaderService.showApi();
    this.failedRequests = 0;

    forkJoin({
      admin: this.guard(this.adminService.getProfile(), null),
      profile: this.guard(this.profileService.getProfile(), null),
      projects: this.guard(this.projectService.getProjects(), []),
      articles: this.guard(this.articleService.getArticles(), []),
      contacts: this.guard(this.contactService.getContacts(), []),
      skills: this.guard(this.skillsService.getSkills(), []),
      experiences: this.guard(this.experienceService.getExperiences(), []),
      education: this.guard(this.educationService.getEducation(), []),
      faqs: this.guard(this.faqService.getFAQs(true), []),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({
          admin,
          profile,
          projects,
          articles,
          contacts,
          skills,
          experiences,
          education,
          faqs,
        }) => {
          const adminObj = (admin as any)?.admin;
          if (adminObj?.name) {
            this.adminName.set(adminObj.name);
            this.adminEmail.set(adminObj.email || '');
          }

          this.profile.set(profile as ProfileResponse | null);
          this.projects.set(projects || []);
          this.articles.set(articles || []);
          this.contacts.set(contacts || []);
          this.skills.set(skills || []);
          this.experiences.set(experiences || []);
          this.education.set(education || []);
          this.faqs.set(faqs || []);

          this.isErrorMsg.set(this.failedRequests === this.requestCount);
          this.settleLoading();

          // if (isRefresh) this.snackBar.success('Dashboard updated');
        },
        error: () => {
          this.isErrorMsg.set(true);
          this.settleLoading();
          // this.snackBar.error('Failed to load some dashboard data');
        },
      });
  }

  /**
   * Keeps one dead endpoint from blanking the whole dashboard: each source falls back
   * to an empty value and only counts itself as failed. `<app-error />` shows when
   * every one of them failed, i.e. the API itself is down.
   */
  private guard<T>(source: Observable<T>, fallback: T): Observable<T> {
    return source.pipe(
      catchError(() => {
        this.failedRequests++;
        return of(fallback);
      }),
    );
  }

  private settleLoading(): void {
    this.isRefreshing.set(false);
    this.loaderService.hideApi();
  }

  markContactRead(contact: ContactResponse, event: MouseEvent): void {
    event.stopPropagation();
    if (contact.isRead) return;

    this.contactService.markAsRead(contact._id).subscribe({
      next: () => {
        this.contacts.update((list) =>
          list.map((c) => (c._id === contact._id ? { ...c, isRead: true } : c)),
        );
        this.snackBar.success('Inquiry marked as read');
      },
      error: () => this.snackBar.error('Failed to mark inquiry as read'),
    });
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return (parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).toUpperCase();
  }

  getAvatarColor(name: string): string {
    const palette = [
      'bg-indigo-600 text-white',
      'bg-emerald-600 text-white',
      'bg-rose-600 text-white',
      'bg-amber-600 text-white',
      'bg-sky-600 text-white',
      'bg-violet-600 text-white',
      'bg-teal-600 text-white',
      'bg-fuchsia-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
  }
}
