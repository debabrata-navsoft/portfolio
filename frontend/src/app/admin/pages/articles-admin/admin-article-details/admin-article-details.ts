import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  NgZone,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, switchMap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { ArticleService } from '../../../../core/services/article.service';
import { SnackBarService } from '../../../../core/services/snack-bar.service';
import { LoaderService } from '../../../../core/services/loader.service';
import { ImageModal } from '../../../../shared/components/image-modal/image-modal';
import { ArticleResponse } from '../../../../models/article.model';
import { Error } from '../../../../shared/components/error/error';
import { FormatTextPipe } from '../../../../pipes/format-text.pipe';
import { CodeCopyDirective } from '../../../../shared/directives/code-copy.directive';
import { ArticleComments } from '../../../../shared/components/article-comments/article-comments';
import { ConfirmDialogService } from '../../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-admin-article-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    LucideAngularModule,
    Error,
    FormatTextPipe,
    CodeCopyDirective,
    ImageModal,
    ArticleComments,
  ],
  templateUrl: './admin-article-details.html',
})
export class AdminArticleDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private loaderService = inject(LoaderService);
  private snackBar = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  article = signal<ArticleResponse | null>(null);
  commentCount = signal(0);
  clearingStats = signal(false);
  isErrorMsg = signal(false);
  copiedSlug = signal(false);
  activeImage = signal<string | null>(null);
  isImageModalOpen = signal(false);

  wordCount = computed(() => {
    const text = this.article()?.content || '';
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) return EMPTY;
          this.loaderService.showApi();
          this.article.set(null);
          return this.articleService.getArticleBySlug(slug);
        }),
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.article.set(res);
            this.loaderService.hideApi();
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.isErrorMsg.set(true);
            this.loaderService.hideApi();
            this.snackBar.error(err.error?.message || 'Article not found');
            this.cdr.detectChanges();
          });
        },
      });
  }

  copySlug(slug: string): void {
    navigator.clipboard.writeText(slug);
    this.copiedSlug.set(true);
    this.snackBar.success('Slug copied to clipboard');
    setTimeout(() => this.copiedSlug.set(false), 2000);
  }

  async deleteArticle(): Promise<void> {
    const current = this.article();
    if (!current) return;

    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete article?',
      message: `"${current.title}" will be permanently deleted.`,
    });
    if (!confirmed) return;

    this.loaderService.showApi();
    this.articleService
      .deleteArticle(current._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loaderService.hideApi();
          this.snackBar.success('Article deleted successfully');
          this.router.navigate(['/admin/articles']);
        },
        error: (err) => {
          this.loaderService.hideApi();
          this.snackBar.error(err.error?.message || 'Failed to delete article');
        },
      });
  }

  /** Wipes the view and like counters — there is no undo, so confirm first. */
  async clearStats(slug: string): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Clear views and likes?',
      message: 'Both counters go back to 0. This cannot be undone.',
      confirmText: 'Clear',
    });
    if (!confirmed) return;

    this.clearingStats.set(true);

    this.articleService
      .resetStats(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            this.article.update((current) =>
              current ? { ...current, views: res.views, likes: res.likes } : current,
            );
            this.clearingStats.set(false);
            this.snackBar.success(res.message);
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.clearingStats.set(false);
            this.snackBar.error(err.error?.message || 'Failed to clear stats');
            this.cdr.detectChanges();
          });
        },
      });
  }

  openImage(url?: string | null): void {
    if (url?.trim()) {
      this.activeImage.set(url.trim());
      this.isImageModalOpen.set(true);
    }
  }
}
