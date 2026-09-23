export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'date';
  searchable?: boolean;
  // Mutually exclusive options (e.g. Status): picking one unticks the rest.
  single?: boolean;
  options?: FilterOption[];
}

export interface DateRange {
  from: string;
  to: string;
}

export interface FilterSelection {
  checkboxes: Record<string, string[]>;
  dates: Record<string, DateRange>;
}

/** One applied filter, shown as a removable chip next to the result count. */
export interface FilterChip {
  groupId: string;
  groupLabel: string;
  /** Option id for checkbox groups, empty for a date range (which clears both bounds). */
  value: string;
  label: string;
}

/** A distinct value with its document count, as returned by the list endpoints. */
export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

/** Pagination envelope shared by the paged list endpoints. */
export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListQuery {
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest';
  countOnly?: boolean;
}
