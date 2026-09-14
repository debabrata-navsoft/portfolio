import { HttpParams } from '@angular/common/http';

import {
  DateRange,
  FacetOption,
  FilterChip,
  FilterGroup,
  FilterOption,
  FilterSelection,
  PagedResponse,
} from '../../models/filter.model';

export function emptyFilterSelection(): FilterSelection {
  return { checkboxes: {}, dates: {} };
}

/** Deep copy so a drawer draft never mutates the applied selection. */
export function cloneFilterSelection(selection: FilterSelection): FilterSelection {
  const checkboxes: Record<string, string[]> = {};
  const dates: Record<string, DateRange> = {};

  for (const [groupId, values] of Object.entries(selection.checkboxes)) {
    checkboxes[groupId] = [...values];
  }

  for (const [groupId, range] of Object.entries(selection.dates)) {
    dates[groupId] = { ...range };
  }

  return { checkboxes, dates };
}

/** Number of groups that actually narrow the list — drives the badge on the filter icon. */
export function countActiveFilters(selection: FilterSelection): number {
  const checkboxCount = Object.values(selection.checkboxes).filter(
    (values) => values.length > 0,
  ).length;

  const dateCount = Object.values(selection.dates).filter(
    (range) => !!range.from || !!range.to,
  ).length;

  return checkboxCount + dateCount;
}

const formatChipDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

const dateRangeLabel = (range: DateRange): string => {
  if (range.from && range.to) return `${formatChipDate(range.from)} - ${formatChipDate(range.to)}`;
  if (range.from) return `From ${formatChipDate(range.from)}`;

  return `Until ${formatChipDate(range.to)}`;
};

/** The applied filters as chips, labelled from the group/option metadata. */
export function buildFilterChips(groups: FilterGroup[], selection: FilterSelection): FilterChip[] {
  const chips: FilterChip[] = [];

  for (const group of groups) {
    if (group.type === 'checkbox') {
      for (const value of selection.checkboxes[group.id] ?? []) {
        const option = group.options?.find((item) => item.id === value);

        chips.push({
          groupId: group.id,
          groupLabel: group.label,
          value,
          label: option?.label ?? value,
        });
      }

      continue;
    }

    const range = selection.dates[group.id];

    if (range && (range.from || range.to)) {
      chips.push({
        groupId: group.id,
        groupLabel: group.label,
        value: '',
        label: dateRangeLabel(range),
      });
    }
  }

  return chips;
}

/** Drops the chip's value from the selection (a date chip clears the whole range). */
export function removeFilterChip(selection: FilterSelection, chip: FilterChip): FilterSelection {
  const next = cloneFilterSelection(selection);

  if (chip.value) {
    next.checkboxes[chip.groupId] = (next.checkboxes[chip.groupId] ?? []).filter(
      (value) => value !== chip.value,
    );
  } else {
    delete next.dates[chip.groupId];
  }

  return next;
}

/** Turns an API facet (value + count) into a drawer checkbox option. */
export function facetToOption(facet: FacetOption): FilterOption {
  return { id: facet.value, label: facet.label, count: facet.count };
}

export function selectedValues(selection: FilterSelection, groupId: string): string[] {
  return selection.checkboxes[groupId] ?? [];
}

export function dateBound(
  selection: FilterSelection,
  groupId: string,
  bound: 'from' | 'to',
): string | undefined {
  return selection.dates[groupId]?.[bound] || undefined;
}

/**
 * Accepts either the paged envelope or a bare array (an API that hasn't been
 * redeployed yet) so a shape mismatch degrades instead of crashing the page.
 */
export function normalizeListResponse<T, F>(
  res: unknown,
  emptyFilters: F,
  page = 1,
  limit = 0,
): PagedResponse<T> & { filters: F } {
  if (Array.isArray(res)) {
    const items = res as T[];

    return {
      items,
      total: items.length,
      page: 1,
      limit: 0,
      totalPages: items.length ? 1 : 0,
      filters: emptyFilters,
    };
  }

  const envelope = (res ?? {}) as Partial<PagedResponse<T> & { filters: F }>;
  const items = envelope.items ?? [];
  const total = envelope.total ?? items.length;

  return {
    items,
    total,
    page: envelope.page ?? page,
    limit: envelope.limit ?? limit,
    totalPages: envelope.totalPages ?? (limit ? Math.ceil(total / limit) : total ? 1 : 0),
    filters: envelope.filters ?? emptyFilters,
  };
}

/** Drops empty values and joins arrays into the comma-separated form the API expects. */
export function toHttpParams(query: Record<string, unknown>): HttpParams {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      params = params.set(key, value.join(','));
      continue;
    }

    params = params.set(key, String(value));
  }

  return params;
}
