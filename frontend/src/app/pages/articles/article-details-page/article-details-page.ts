import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
  NgZone,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { ArticleService } from '../../../core/services/article.service';
import { LoaderService } from '../../../core/services/loader.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { ImageModal } from '../../../shared/components/image-modal/image-modal';
import { ArticleResponse } from '../../../models/article.model';
import { Error } from '../../../shared/components/error/error';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { FormatTextPipe } from '../../../pipes/format-text.pipe';
import { CodeCopyDirective } from '../../../shared/directives/code-copy.directive';
import { GradientText } from '../../../shared/components/gradient-text/gradient-text';
import { fadeUpAnimation } from '../../../shared/animation/page.animations';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { ArticleComments } from '../../../shared/components/article-comments/article-comments';

const LIKED_KEY = 'likedArticles';
const VIEWED_KEY = 'viewedArticles';

@Component({
  selector: 'app-article-details-page',
  standalone: true,
  imports: [
    Error,
    TimeAgoPipe,
    FormatTextPipe,
    CodeCopyDirective,
    GradientText,
    LucideAngularModule,
    RevealDirective,
    ImageModal,
    ArticleComments,
  ],
  templateUrl: './article-details-page.html',
  styleUrl: './article-details-page.css',
  animations: [fadeUpAnimation],
})
export class ArticleDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private loaderService = inject(LoaderService);
  private snackBarService = inject(SnackBarService);
  private destroyRef = inject(DestroyRef);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  articles = signal<ArticleResponse | null>(null);
  isErrorMsg = signal(false);
  isImageModalOpen = signal(false);
  isCommentsOpen = signal(false);

  views = signal(0);
  likes = signal(0);
  liked = signal(false);
  commentCount = signal(0);

  ngOnInit(): void {
    const articleSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const blogSlug = params.get('slug');

          if (!blogSlug) return EMPTY;

          this.articles.set(null);
          this.loaderService.showApi();
          return this.articleService.getArticleBySlug(blogSlug);
        }),
      )
      .subscribe({
        next: (res) => {
          this.inZone(() => {
            this.articles.set(res);
            this.views.set(res.views || 0);
            this.likes.set(res.likes || 0);
    
            const liked = this.storedIds(LIKED_KEY).includes(res.slug) && (res.likes || 0) > 0;
            this.liked.set(liked);
            if (!liked) this.storeId(LIKED_KEY, res.slug, false);
            this.loaderService.hideApi();
          });

          this.countView(res.slug);
        },

        error: (err) => {
          this.inZone(() => {
            this.isErrorMsg.set(true);
            this.loaderService.hideApi();
            this.snackBarService.error(err.error?.message || 'Blog not Found');
          });
        },
      });

    this.destroyRef.onDestroy(() => {
      articleSub.unsubscribe();
    });
  }

  @HostListener('document:keydown.escape')
  closeComments() {
    this.isCommentsOpen.set(false);
  }

  toggleLike() {
    const article = this.articles();
    if (!article || !this.isBrowser) return;

    const liked = !this.liked();

    this.applyLike(article.slug, liked);

    const likeSub = this.articleService.toggleLike(article.slug, liked).subscribe({
      next: (res) => this.inZone(() => this.likes.set(res.likes)),
    
      error: (err) =>
        this.inZone(() => {
          this.applyLike(article.slug, !liked);
          this.snackBarService.error(err.error?.message || "Couldn't save your like");
        }),
    });

    this.destroyRef.onDestroy(() => likeSub.unsubscribe());
  }

  private applyLike(slug: string, liked: boolean) {
    this.liked.set(liked);
    this.likes.update((count) => Math.max(0, count + (liked ? 1 : -1)));
    this.storeId(LIKED_KEY, slug, liked);
  }

  private countView(slug: string) {
    if (!this.isBrowser || this.storedIds(VIEWED_KEY).includes(slug)) return;

    const viewSub = this.articleService.registerView(slug).subscribe({
      next: (res) => {
        this.storeId(VIEWED_KEY, slug, true);
        this.inZone(() => this.views.set(res.views));
      },
      // A missed view must never break the page.
      error: () => {},
    });

    this.destroyRef.onDestroy(() => viewSub.unsubscribe());
  }

  /** Signal writes from outside Angular's zone need a nudge to repaint. */
  private inZone(update: () => void) {
    this.ngZone.run(() => {
      update();
      this.cdr.detectChanges();
    });
  }

  /** Visitors have no account, so "already liked / already read" lives per browser. */
  private storedIds(key: string): string[] {
    if (!this.isBrowser) return [];

    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  private storeId(key: string, slug: string, on: boolean) {
    // The article fetch resolves during SSR too, where there is no localStorage.
    if (!this.isBrowser) return;

    const slugs = this.storedIds(key).filter((saved) => saved !== slug);

    if (on) slugs.push(slug);

    localStorage.setItem(key, JSON.stringify(slugs));
  }
}
