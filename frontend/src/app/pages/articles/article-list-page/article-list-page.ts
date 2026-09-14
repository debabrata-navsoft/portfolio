import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, EMPTY, Subject, switchMap, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ArticleService } from '../../../core/services/article.service';
import { LoaderService } from '../../../core/services/loader.service';
import { ArticleListFilters, ArticleQuery, ArticleResponse } from '../../../models/article.model';
import { FilterChip, FilterGroup, FilterSelection } from '../../../models/filter.model';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { Error } from '../../../shared/components/error/error';
import { GradientText } from '../../../shared/components/gradient-text/gradient-text';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { CustomNav } from '../../../shared/components/custom-nav/custom-nav';
import { ListToolbar } from '../../../shared/components/list-toolbar/list-toolbar';
import { FilterDrawer } from '../../../shared/filters/filter-drawer/filter-drawer';
import {
  buildFilterChips,
  cloneFilterSelection,
  countActiveFilters,
  dateBound,
  emptyFilterSelection,
  facetToOption,
  removeFilterChip,
  selectedValues,
} from '../../../shared/filters/filter.utils';

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
  styleUrl: './article-list-page.css',
  // animations: [listAnimation],
})
export class ArticleListPage implements OnInit {
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  articles = signal<ArticleResponse[]>([]);
  isLoading = signal(true);
  isErrorMsg = signal(false);
  pageIndex = signal(0);
  pageSize = signal(4);

  // Search / filter state — every change re-queries the API.
  search = signal('');
  total = signal(0);
  isFilterOpen = signal(false);
  appliedFilters = signal<FilterSelection>(emptyFilterSelection());
  draftFilters = signal<FilterSelection>(emptyFilterSelection());
  previewCount = signal(0);
  facets = signal<ArticleListFilters>({ tags: [], readingTimes: [] });

  activeFilterCount = computed(() => countActiveFilters(this.appliedFilters()));

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

  filterChips = computed<FilterChip[]>(() =>
    buildFilterChips(this.filterGroups(), this.appliedFilters()),
  );

  private reload$ = new Subject<void>();
  private searchInput$ = new Subject<void>();
  private previewReload$ = new Subject<void>();

  constructor() {
    // Main list request. switchMap drops the response of a superseded query.
    const listSub = this.reload$
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.loaderService.showApi();
        }),
        switchMap(() =>
          this.articleService.queryArticles(this.buildQuery(this.appliedFilters())).pipe(
            catchError((err) => {
              console.log(err.message);
              this.isErrorMsg.set(true);
              this.isLoading.set(false);
              this.loaderService.hideApi();

              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe((res) => {
        this.articles.set(res.items);
        this.total.set(res.total);
        this.previewCount.set(res.total);
        this.facets.set(res.filters);
        this.isLoading.set(false);
        this.loaderService.hideApi();
      });

    // Typing only hits the API once the visitor pauses.
    const searchSub = this.searchInput$.pipe(debounceTime(350)).subscribe(() => this.reload());

    // "Total Results" preview for the draft selection inside the drawer.
    const previewSub = this.previewReload$
      .pipe(
        debounceTime(250),
        switchMap(() =>
          this.articleService
            .queryArticles({
              ...this.buildQuery(this.draftFilters()),
              page: 1,
              limit: 1,
              countOnly: true,
            })
            .pipe(catchError(() => EMPTY)),
        ),
      )
      .subscribe((res) => this.previewCount.set(res.total));

    this.destroyRef.onDestroy(() => {
      listSub.unsubscribe();
      searchSub.unsubscribe();
      previewSub.unsubscribe();
    });
  }

  ngOnInit(): void {
    this.reload();
  }

  private buildQuery(selection: FilterSelection): ArticleQuery {
    return {
      search: this.search().trim() || undefined,
      tag: selectedValues(selection, 'tag'),
      readingTime: selectedValues(selection, 'readingTime'),
      createdFrom: dateBound(selection, 'createdAt', 'from'),
      createdTo: dateBound(selection, 'createdAt', 'to'),
      page: this.pageIndex() + 1,
      limit: this.pageSize(),
    };
  }

  private reload(): void {
    this.isErrorMsg.set(false);
    this.reload$.next();
  }

  onSearch(term: string): void {
    this.search.set(term);
    this.pageIndex.set(0);
    this.searchInput$.next();
  }

  openFilters(): void {
    this.draftFilters.set(cloneFilterSelection(this.appliedFilters()));
    this.previewCount.set(this.total());
    this.isFilterOpen.set(true);
  }

  closeFilters(): void {
    this.isFilterOpen.set(false);
  }

  onDraftFiltersChange(selection: FilterSelection): void {
    this.draftFilters.set(selection);
    this.previewReload$.next();
  }

  onApplyFilters(selection: FilterSelection): void {
    this.appliedFilters.set(selection);
    this.draftFilters.set(cloneFilterSelection(selection));
    this.pageIndex.set(0);
    this.isFilterOpen.set(false);
    this.reload();
  }

  onClearFilters(): void {
    this.appliedFilters.set(emptyFilterSelection());
    this.draftFilters.set(emptyFilterSelection());
    this.pageIndex.set(0);
    this.reload();
  }

  onRemoveChip(chip: FilterChip): void {
    const next = removeFilterChip(this.appliedFilters(), chip);

    this.appliedFilters.set(next);
    this.draftFilters.set(cloneFilterSelection(next));
    this.pageIndex.set(0);
    this.reload();
  }

  viewArticle(slug: string) {
    this.router.navigate(['/articles', slug]);
  }

  private scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  }

  nextPage() {
    if (this.pageIndex() < this.totalPages - 1) {
      this.pageIndex.update((page) => page + 1);
      this.reload();
      this.scrollToTop();
    }
  }

  previousPage() {
    if (this.pageIndex() > 0) {
      this.pageIndex.update((page) => page - 1);
      this.reload();
      this.scrollToTop();
    }
  }

  get currentPage() {
    return this.pageIndex() + 1;
  }

  get totalPages() {
    return Math.ceil(this.total() / this.pageSize());
  }
}
