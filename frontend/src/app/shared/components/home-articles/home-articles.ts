import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import { GradientText } from '../gradient-text/gradient-text';

import { CustomNav } from '../custom-nav/custom-nav';
import { Router } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { LoaderService } from '../../../core/services/loader.service';
import { ArticleResponse } from '../../../models/article.model';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { RevealDirective } from '../../directives/reveal.directive';

@Component({
  selector: 'app-home-articles',
  standalone: true,
  imports: [GradientText, LucideAngularModule, CustomNav, TimeAgoPipe, RevealDirective],
  templateUrl: './home-articles.html',
  styleUrl: './home-articles.css',
})
export class HomeArticles {
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  articles = signal<ArticleResponse[]>([]);
  isErrorMsg = signal(false);

  ngOnInit(): void {
    this.loaderService.trackRequest();
    const articleSub = this.articleService.getArticles().subscribe({
      next: (res) => {
        this.articles.set(
          [...res]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4),
        );
        this.loaderService.completeRequest();
      },
      // next: (res) => {
      //   this.articles.set(res);
      // },

      error: (err) => {
        this.isErrorMsg.set(true);

        console.log(err.message);
        this.loaderService.completeRequest();
      },
    });

    this.destroyRef.onDestroy(() => {
      articleSub.unsubscribe();
    });
  }

  viewArticle(slug: string) {
    this.router.navigate(['/articles', slug]);
  }
}
