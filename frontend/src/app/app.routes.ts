import { Routes } from '@angular/router';

import { HomePage } from './pages/home.page/home.page';
import { ProjectsListPage } from './pages/projects/projects-list.page/projects-list.page';
import { ArticleListPage } from './pages/articles/article-list-page/article-list-page';
import { ContactPage } from './pages/contact-page/contact-page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },

  {
    path: 'projects',
    children: [
      {
        path: '',
        component: ProjectsListPage,
      },

      {
        path: ':slug',
        loadComponent: () =>
          import('./pages/projects/project-details.page/project-details.page').then(
            (m) => m.ProjectDetailsPage,
          ),
      },
    ],
  },

  {
    path: 'articles',
    children: [
      {
        path: '',
        component: ArticleListPage,
      },

      {
        path: ':slug',
        loadComponent: () =>
          import('./pages/articles/article-details-page/article-details-page').then(
            (m) => m.ArticleDetailsPage,
          ),
      },
    ],
  },

  {
    path: 'contact',
    component: ContactPage,
  },

  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
];
