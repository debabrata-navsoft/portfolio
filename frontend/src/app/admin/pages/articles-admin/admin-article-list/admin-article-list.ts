import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ArticleService } from '../../../../core/services/article.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { ArticleResponse } from '../../../../models/article.model';
import { Error } from '../../../../shared/components/error/error';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import {
  deleteAction,
  editAction,
  TableAction,
  TableActionEvent,
  TableColumn,
  TableFilter,
  viewAction,
} from '../../../../shared/components/data-table/data-table.model';

@Component({
  selector: 'app-admin-article-list',
  standalone: true,
  imports: [Error, DataTable],
  templateUrl: './admin-article-list.html',
  styleUrl: './admin-article-list.css',
  host: { class: 'flex min-h-0 min-w-0 flex-1 flex-col h-full' },
})
export class AdminArticleList implements OnInit {
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private loaderService = inject(LoaderService);
  private snackBarService = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);

  articles = signal<ArticleResponse[]>([]);
  isErrorMsg = signal(false);

  readonly columns: TableColumn<ArticleResponse>[] = [
    { key: 'id', header: 'ID', type: 'index', align: 'center' },
    { key: 'image', header: 'IMAGE', type: 'image', imageAlt: (row) => row.title },
    { key: 'title', header: 'ARTICLE TITLE', cellClass: 'tbl-col-title' },
    { key: 'createdAt', header: 'DATE', type: 'date' },
    { key: 'tags', header: 'TAGS', type: 'tags' },
    {
      key: 'published',
      header: 'STATUS',
      type: 'badge',
      align: 'center',
      value: (row) => (row.published ? 'Published' : 'Draft'),
    },
  ];

  readonly filters: TableFilter<ArticleResponse>[] = [
    { key: 'tags', label: 'Tag' },
    {
      key: 'published',
      label: 'Status',
      value: (row) => (row.published ? 'published' : 'draft'),
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
      ],
    },
    { key: 'createdAt', label: 'Created Date', type: 'date' },
  ];

  readonly actions: TableAction<ArticleResponse>[] = [
    viewAction('article', 'eye'),
    editAction('article'),
    deleteAction('article'),
  ];

  ngOnInit(): void {
    this.loaderService.showApi();

    const articleSub = this.articleService.getArticles().subscribe({
      next: (res) => {
        this.articles.set(
          res.sort(
            (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          ),
        );

        this.loaderService.hideApi();
      },

      error: (err) => {
        this.loaderService.hideApi();
        this.isErrorMsg.set(true);
        console.log(err.error?.message);
      },
    });

    this.destroyRef.onDestroy(() => {
      articleSub.unsubscribe();
    });
  }

  onAction(event: TableActionEvent<ArticleResponse>) {
    switch (event.id) {
      case 'view':
        this.viewArticle(event.row.slug);
        break;
      case 'edit':
        this.editArticle(event.row.slug);
        break;
      case 'delete':
        this.deleteArticle(event.row._id);
        break;
    }
  }

  deleteArticle(id: string) {
    const confirmed = confirm('Are you sure you want to delete this Article?');

    if (!confirmed) return;

    const deleteSub = this.articleService.deleteArticle(id).subscribe({
      next: (res) => {
        this.articles.update((items) => items.filter((article) => article._id !== id));
        this.snackBarService.success(res.message);
      },
      error: (err) => {
        this.snackBarService.error(err.error?.message || 'Failed to delete');
      },
    });

    this.destroyRef.onDestroy(() => {
      deleteSub.unsubscribe();
    });
  }

  addArticle() {
    this.router.navigate(['/admin/articles/add']);
  }

  editArticle(slug: string) {
    this.router.navigate(['/admin/articles/edit', slug]);
  }

  viewArticle(slug: string) {
    this.router.navigate(['/admin/articles', slug]);
  }
}
