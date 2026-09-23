import { Routes } from '@angular/router';

import { AdminLayout } from './layout/admin-layout/admin-layout';
import { adminGuard } from '../core/guards/admin-guard';
import { AdminLogin } from './auth/admin-login/admin-login';
import { DashboardAdmin } from './pages/dashboard-admin/dashboard-admin';
import { AdminProjectList } from './pages/projects-admin/admin-project-list/admin-project-list';
import { AdminArticleList } from './pages/articles-admin/admin-article-list/admin-article-list';
import { AdminFaqList } from './pages/faq-admin/admin-faq-list/admin-faq-list';
import { AdminContactList } from './pages/contact-admin/admin-contact-list/admin-contact-list';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    component: AdminLogin,
    canActivate: [adminGuard],
  },

  {
    path: '',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardAdmin,
      },

      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile-admin/profile-admin').then((m) => m.ProfileAdmin),
      },

      {
        path: 'projects',
        children: [
          {
            path: '',
            component: AdminProjectList,
          },

          {
            path: 'add',
            loadComponent: () =>
              import('./pages/projects-admin/admin-project-form/admin-project-form').then(
                (m) => m.AdminProjectForm,
              ),
          },

          {
            path: 'edit/:slug',
            loadComponent: () =>
              import('./pages/projects-admin/admin-project-form/admin-project-form').then(
                (m) => m.AdminProjectForm,
              ),
          },

          {
            path: ':slug',
            loadComponent: () =>
              import('./pages/projects-admin/admin-project-detail/admin-project-detail').then(
                (m) => m.AdminProjectDetail,
              ),
          },
        ],
      },

      {
        path: 'articles',
        children: [
          {
            path: '',
            component: AdminArticleList,
          },

          {
            path: 'add',
            loadComponent: () =>
              import('./pages/articles-admin/admin-article-form/admin-article-form').then(
                (m) => m.AdminArticleForm,
              ),
          },

          {
            path: 'edit/:slug',
            loadComponent: () =>
              import('./pages/articles-admin/admin-article-form/admin-article-form').then(
                (m) => m.AdminArticleForm,
              ),
          },

          {
            path: ':slug',
            loadComponent: () =>
              import('./pages/articles-admin/admin-article-details/admin-article-details').then(
                (m) => m.AdminArticleDetails,
              ),
          },
        ],
      },

      {
        path: 'faqs',
        children: [
          {
            path: '',
            component: AdminFaqList,
          },

          {
            path: 'add',
            loadComponent: () =>
              import('./pages/faq-admin/admin-faq-form/admin-faq-form').then((m) => m.AdminFaqForm),
          },

          {
            path: 'edit/:id',
            loadComponent: () =>
              import('./pages/faq-admin/admin-faq-form/admin-faq-form').then((m) => m.AdminFaqForm),
          },
        ],
      },

      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications-admin/admin-notification-list/admin-notification-list').then(
            (m) => m.AdminNotificationList,
          ),
      },

      {
        path: 'contacts',
        children: [
          {
            path: '',
            component: AdminContactList,
          },

          {
            path: ':id',
            loadComponent: () =>
              import('./pages/contact-admin/admin-contact-detail/admin-contact-detail').then(
                (m) => m.AdminContactDetail,
              ),
          },
        ],
      },
    ],
  },
];
