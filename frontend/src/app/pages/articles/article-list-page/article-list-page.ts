import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ArticleService } from '../../../core/services/article.service';
import { ArticleListFilters, ArticleQuery, ArticleResponse } from '../../../models/article.model';
import { FilterGroup, FilterSelection } from '../../../models/filter.model';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { Error } from '../../../shared/components/error/error';
import { GradientText } from '../../../shared/components/gradient-text/gradient-text';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { CustomNav } from '../../../shared/components/custom-nav/custom-nav';
import { ListToolbar } from '../../../shared/components/list-toolbar/list-toolbar';
import { FilterDrawer } from '../../../shared/filters/filter-drawer/filter-drawer';
import { ServerListPage } from '../../../shared/filters/server-list-page';
import { dateBound, facetToOption, selectedValues } from '../../../utils/filter.utils';

@Component({
  selector: 'app-article-list-page',
  standalone: true,
  imports: [
    Error,
    TimeAgoPipe,
    GradientText,
    LucideAngularModule,
    RevealDirective,
    CustomNav,
    ListToolbar,
    FilterDrawer,
  ],
  templateUrl: './article-list-page.html',
})
export class ArticleListPage extends ServerListPage<
  ArticleResponse,
  ArticleListFilters,
  ArticleQuery
> {
  private router = inject(Router);
  private articleService = inject(ArticleService);

  filterGroups = computed<FilterGroup[]>(() => [
    {
      id: 'tag',
      label: 'Tags',
      type: 'checkbox',
      searchable: true,
      options: this.facets().tags.map(facetToOption),
    },
    {
      id: 'readingTime',
      label: 'Reading Time',
      type: 'checkbox',
      options: this.facets().readingTimes.map(facetToOption),
    },
    { id: 'createdAt', label: 'Created Date', type: 'date' },
  ]);

  protected emptyFacets(): ArticleListFilters {
    return { tags: [], readingTimes: [] };
  }

  protected fetch(query: ArticleQuery) {
    return this.articleService.queryArticles(query);
  }

  protected filterQuery(selection: FilterSelection): ArticleQuery {
    return {
      tag: selectedValues(selection, 'tag'),
      readingTime: selectedValues(selection, 'readingTime'),
      createdFrom: dateBound(selection, 'createdAt', 'from'),
      createdTo: dateBound(selection, 'createdAt', 'to'),
      published: true, // hide drafts from a signed-in admin too
    };
  }

  viewArticle(slug: string) {
    this.router.navigate(['/articles', slug]);
  }
}
