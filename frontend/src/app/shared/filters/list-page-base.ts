import { computed, DestroyRef, Directive, inject, OnInit, signal } from '@angular/core';
import { debounceTime, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoaderService } from '../../core/services/loader.service';
import {
  FilterChip,
  FilterGroup,
  FilterSelection,
  ListQuery,
  PagedResponse,
} from '../../models/filter.model';
import {
  buildFilterChips,
  cloneFilterSelection,
  countActiveFilters,
  emptyFilterSelection,
  removeFilterChip,
} from '../../utils/filter.utils';

/**
 * Search / filter drawer / paging state shared by the public list pages, which query the
 * API on every change. A page supplies the request, its filter groups and the selection →
 * query mapping; switchMap drops the response of a superseded query.
 */
@Directive()
export abstract class ListPageBase<TItem, TFilters, TQuery extends ListQuery>
  implements OnInit
{
  private loaderService = inject(LoaderService);
  private destroyRef = inject(DestroyRef);

  items = signal<TItem[]>([]);
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
  facets = signal<TFilters>(this.emptyFacets());

  activeFilterCount = computed(() => countActiveFilters(this.appliedFilters()));

  filterChips = computed<FilterChip[]>(() =>
    buildFilterChips(this.filterGroups(), this.appliedFilters()),
  );

  abstract filterGroups: () => FilterGroup[];
  protected abstract emptyFacets(): TFilters;
  protected abstract fetch(query: TQuery): Observable<PagedResponse<TItem> & { filters: TFilters }>;
  /** The resource-specific query params for a filter selection. */
  protected abstract filterQuery(selection: FilterSelection): TQuery;

  private reload$ = new Subject<void>();
  private searchInput$ = new Subject<void>();
  private previewReload$ = new Subject<void>();

  constructor() {
    const listSub = this.reload$
      .pipe(
        tap(() => {
          this.isLoading.set(true);
          this.loaderService.showApi();
        }),
        switchMap(() =>
          this.fetch(this.buildQuery(this.appliedFilters())).pipe(
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
        this.items.set(res.items);
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
          this.fetch({
            ...this.buildQuery(this.draftFilters()),
            page: 1,
            limit: 1,
            countOnly: true,
          }).pipe(catchError(() => EMPTY)),
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

  private buildQuery(selection: FilterSelection): TQuery {
    return {
      ...this.filterQuery(selection),
      search: this.search().trim() || undefined,
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
    this.isFilterOpen.set(false);
    this.applySelection(selection);
  }

  onClearFilters(): void {
    this.applySelection(emptyFilterSelection());
  }

  onRemoveChip(chip: FilterChip): void {
    this.applySelection(removeFilterChip(this.appliedFilters(), chip));
  }

  private applySelection(selection: FilterSelection): void {
    this.appliedFilters.set(selection);
    this.draftFilters.set(cloneFilterSelection(selection));
    this.pageIndex.set(0);
    this.reload();
  }

  nextPage() {
    if (this.pageIndex() < this.totalPages - 1) this.goToPage(this.pageIndex() + 1);
  }

  previousPage() {
    if (this.pageIndex() > 0) this.goToPage(this.pageIndex() - 1);
  }

  private goToPage(index: number): void {
    this.pageIndex.set(index);
    this.reload();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  get currentPage() {
    return this.pageIndex() + 1;
  }

  get totalPages() {
    return Math.ceil(this.total() / this.pageSize());
  }
}
