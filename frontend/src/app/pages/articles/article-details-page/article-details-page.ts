import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  NgZone,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';

import { ArticleService } from '../../../core/services/article.service';
import { LoaderService } from '../../../core/services/loader.service';
import { SnackBarService } from '../../../core/services/snack-bar.service';
import { ArticleResponse } from '../../../models/article.model';
import { Error } from '../../../shared/components/error/error';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { GradientText } from '../../../shared/components/gradient-text/gradient-text';
import { fadeUpAnimation } from '../../../shared/animation/page.animations';
import { RevealDirective } from '../../../shared/directives/reveal.directive';

@Component({
  selector: 'app-article-details-page',
  standalone: true,
  imports: [Error, TimeAgoPipe, GradientText, LucideAngularModule, RevealDirective],
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

  articles = signal<ArticleResponse | null>(null);
  isErrorMsg = signal(false);
  imagePopup = signal(false);

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
          this.ngZone.run(() => {
            this.articles.set(res);
            this.loaderService.hideApi();
            this.cdr.detectChanges();
          });
        },

        error: (err) => {
          this.ngZone.run(() => {
            this.isErrorMsg.set(true);
            this.loaderService.hideApi();
            this.snackBarService.error(err.error?.message || 'Blog not Found');
            this.cdr.detectChanges();
          });
        },
      });

    this.destroyRef.onDestroy(() => {
      articleSub.unsubscribe();
    });
  }
}
