import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChildren,
  input,
  linkedSignal,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { LucideAngularModule } from 'lucide-angular';

import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import {
  FilterChip,
  FilterGroup,
  FilterOption,
  FilterSelection,
} from '../../../models/filter.model';
import { FilterDrawer } from '../../filters/filter-drawer/filter-drawer';
import {
  buildFilterChips,
  cloneFilterSelection,
  countActiveFilters,
  emptyFilterSelection,
  removeFilterChip,
} from '../../filters/filter.utils';
import { TableCell } from './table-cell.directive';
import {
  SortDirection,
  TableAction,
  TableActionEvent,
  TableAlign,
  TableCellContext,
  TableColumn,
  TableColumnType,
  TableFilter,
  TableSortEvent,
  ValueSource,
  ViewColumn,
} from './data-table.model';

const UNSEARCHABLE: TableColumnType[] = ['index', 'image', 'progress'];
const UNSORTABLE: TableColumnType[] = ['image', 'progress', 'tags'];
const SEARCHABLE_GROUP_SIZE = 6;

const ALIGN: Record<TableAlign, string> = {
  left: 'text-left tbl-align-left',
  center: 'text-center tbl-align-center',
  right: 'text-right tbl-align-right',
};

const COLUMN_CLASS: Partial<Record<TableColumnType, string>> = {
  index: 'tbl-col-index',
  image: 'tbl-col-image',
  date: 'tbl-col-date',
};

const BADGE_VARIANTS: [RegExp, string][] = [
  [/\b(approved|active|published)\b/, 'tbl-badge-success'],
  [/\b(rejected|inactive|inquiry|danger)\b/, 'tbl-badge-danger'],
  [/\b(draft|pending|warning)\b/, 'tbl-badge-warning'],
  [/\bread\b/, 'tbl-badge-read'],
];

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    LucideAngularModule,
    MatPaginatorModule,
    NgTemplateOutlet,
    DatePipe,
    TimeAgoPipe,
    FilterDrawer,
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
  host: { class: 'flex min-h-0 min-w-0 flex-1 flex-col h-full' },
})
export class DataTable<T> {
  columns = input.required<TableColumn<T>[]>();
  rows = input.required<T[]>();
  trackKey = input('_id');

  actions = input<TableAction<T>[]>([]);
  actionsHeader = input('Actions');

  searchable = input(true);
  searchPlaceholder = input('Search');
  filters = input<TableFilter<T>[]>([]);

  primaryButtonText = input<string>('');
  primaryButtonIcon = input('plus');

  paginate = input(true);
  pageSize = input(10);
  pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  showFirstLastButtons = input(false);

  defaultSortColumn = input<string | null>(null);
  defaultSortDirection = input<SortDirection>(null);

  emptyMessage = input('No records found.');
  tableClass = input('w-full');

  action = output<TableActionEvent<T>>();
  primaryAction = output<void>();
  sortChange = output<TableSortEvent>();

  search = signal('');
  selection = signal<FilterSelection>(emptyFilterSelection());
  draft = signal<FilterSelection>(emptyFilterSelection());
  filtersOpen = signal(false);
  pageIndex = signal(0);
  activePageSize = linkedSignal(() => this.pageSize());

  sortColumn = linkedSignal<string | null>(() => this.defaultSortColumn());
  sortDirection = linkedSignal<SortDirection>(() => this.defaultSortDirection());

  private cellTemplates = contentChildren(TableCell);

  templates = computed(
    () =>
      new Map<string, TemplateRef<TableCellContext>>(
        this.cellTemplates().map((cell) => [cell.appTableCell(), cell.template]),
      ),
  );

  viewColumns = computed<ViewColumn<T>[]>(() =>
    this.columns().map((column) => {
      const type = column.type ?? 'text';
      const align = column.align ?? 'left';
      const sortable = column.sortable ?? !UNSORTABLE.includes(type);
      const base = `px-3.5 py-2.5 ${ALIGN[align]} ${COLUMN_CLASS[type] ?? ''}`;

      return {
        ...column,
        type,
        sortable,
        thClass:
          `${base} ${column.headerClass || 'font-semibold text-gray-700'}` +
          (sortable ? ' cursor-pointer select-none transition-colors hover:bg-slate-300' : ''),
        thInnerClass:
          'inline-flex items-center gap-1' +
          (align === 'center' ? ' w-full justify-center' : align === 'right' ? ' justify-end' : ''),
        tdClass: `${base} ${column.cellClass || 'text-gray-700'}`,
        thTitle: sortable ? `Sort by ${column.header}` : null,
      };
    }),
  );

  showToolbar = computed(
    () => this.searchable() || this.filters().length > 0 || !!this.primaryButtonText(),
  );
  columnCount = computed(() => this.columns().length + (this.actions().length ? 1 : 0));

  filterGroups = computed<FilterGroup[]>(() =>
    this.filters().map((filter) => {
      if ((filter.type ?? 'checkbox') === 'date') {
        return { id: filter.key, label: filter.label, type: 'date' };
      }

      const counts = new Map<string, FilterOption>();

      for (const row of this.rows()) {
        for (const raw of this.values(filter, row)) {
          const id = raw.toLowerCase();
          const seen = counts.get(id);

          if (seen) seen.count++;
          else counts.set(id, { id, label: raw, count: 1 });
        }
      }

      const options = filter.options
        ? filter.options.map(({ value, label }) => ({
            id: value.toLowerCase(),
            label,
            count: counts.get(value.toLowerCase())?.count ?? 0,
          }))
        : [...counts.values()].sort((a, b) => a.label.localeCompare(b.label));

      return {
        id: filter.key,
        label: filter.label,
        type: 'checkbox' as const,
        searchable: options.length > SEARCHABLE_GROUP_SIZE,
        options,
      };
    }),
  );

  activeFilterCount = computed(() => countActiveFilters(this.selection()));
  chips = computed(() => buildFilterChips(this.filterGroups(), this.selection()));

  private searchColumns = computed(() =>
    this.viewColumns().filter(
      (column) => column.searchable !== false && !UNSEARCHABLE.includes(column.type),
    ),
  );

  filteredRows = computed(() => {
    const rows = this.narrow(this.selection());
    const direction = this.sortDirection();
    const key = this.sortColumn();
    const column = key && direction ? this.viewColumns().find((c) => c.key === key) : undefined;

    if (!column || !direction) return rows;
    if (column.type === 'index') return direction === 'asc' ? rows : [...rows].reverse();

    const mult = direction === 'asc' ? 1 : -1;
    const isDate = column.type === 'date';

    return [...rows].sort(
      (a, b) =>
        compare(this.cellValue(column, a) ?? '', this.cellValue(column, b) ?? '', isDate) * mult,
    );
  });

  previewCount = computed(() => this.narrow(this.draft()).length);

  safePageIndex = computed(() => {
    const pages = Math.ceil(this.filteredRows().length / this.activePageSize());
    return Math.min(this.pageIndex(), Math.max(0, pages - 1));
  });

  pagedRows = computed(() => {
    if (!this.paginate()) return this.filteredRows();

    const size = this.activePageSize();
    const start = this.safePageIndex() * size;

    return this.filteredRows().slice(start, start + size);
  });

  cellValue(source: ValueSource<T>, row: T): any {
    return source.value ? source.value(row) : (row as Record<string, any>)[source.key];
  }

  values(source: ValueSource<T>, row: T): string[] {
    const raw = this.cellValue(source, row);

    if (raw === null || raw === undefined) return [];

    return (Array.isArray(raw) ? raw : [raw]).map(String).filter(Boolean);
  }

  percent(column: ViewColumn<T>, row: T): number {
    const raw = this.cellValue(column, row);
    const value = typeof raw === 'number' ? raw : parseFloat(raw);

    return isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
  }

  imageAlt(column: ViewColumn<T>, row: T): string {
    return column.imageAlt?.(row) ?? column.header;
  }

  badgeVariant(column: ViewColumn<T>, row: T): string {
    if (column.badgeClass) return column.badgeClass(row);
    if (column.key === 'category') return 'tbl-badge-category';

    const value = String(this.cellValue(column, row) ?? '').toLowerCase();

    return BADGE_VARIANTS.find(([pattern]) => pattern.test(value))?.[1] ?? 'tbl-badge-default';
  }

  trackValue(row: T, index: number): unknown {
    return (row as Record<string, any>)[this.trackKey()] ?? index;
  }

  rowNumber(index: number, column: ViewColumn<T>): number {
    const offset = this.paginate() ? this.safePageIndex() * this.activePageSize() : 0;
    const position = offset + index;
    const isDesc =
      column.indexOrder === 'desc' ||
      (this.sortColumn() === column.key && this.sortDirection() === 'desc');

    return isDesc ? this.filteredRows().length - position : position + 1;
  }

  toggleSort(column: ViewColumn<T>): void {
    if (!column.sortable) return;

    if (this.sortColumn() === column.key) {
      this.sortDirection.update((dir) => (dir === 'desc' ? 'asc' : 'desc'));
    } else {
      this.sortColumn.set(column.key);
      this.sortDirection.set('desc');
    }

    this.pageIndex.set(0);
    this.sortChange.emit({ key: this.sortColumn()!, direction: this.sortDirection() });
  }

  visibleActions(row: T): TableAction<T>[] {
    return this.actions().filter((action) => !action.hidden?.(row));
  }

  openFilters(): void {
    this.draft.set(cloneFilterSelection(this.selection()));
    this.filtersOpen.set(true);
  }

  onApplyFilters(selection: FilterSelection): void {
    this.selection.set(selection);
    this.pageIndex.set(0);
    this.filtersOpen.set(false);
  }

  onClearFilters(): void {
    this.draft.set(emptyFilterSelection());
    this.selection.set(emptyFilterSelection());
    this.pageIndex.set(0);
  }

  removeChip(chip: FilterChip): void {
    this.selection.update((selection) => removeFilterChip(selection, chip));
    this.pageIndex.set(0);
  }

  onSearch(value: string): void {
    this.search.set(value);
    this.pageIndex.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.activePageSize.set(event.pageSize);
  }

  private narrow(selection: FilterSelection): T[] {
    let rows = this.rows();

    for (const filter of this.filters()) {
      if ((filter.type ?? 'checkbox') === 'date') {
        const { from, to } = selection.dates[filter.key] ?? {};
        const min = from ? new Date(from).setHours(0, 0, 0, 0) : null;
        const max = to ? new Date(to).setHours(23, 59, 59, 999) : null;

        if (min === null && max === null) continue;

        rows = rows.filter((row) => {
          const raw = this.cellValue(filter, row);
          const time = raw ? new Date(raw).getTime() : NaN;

          return !isNaN(time) && (min === null || time >= min) && (max === null || time <= max);
        });
      } else {
        const picked = selection.checkboxes[filter.key];

        if (!picked?.length) continue;

        rows = rows.filter((row) =>
          this.values(filter, row).some((value) => picked.includes(value.toLowerCase())),
        );
      }
    }

    const term = this.search().trim().toLowerCase();

    return term ? rows.filter((row) => this.searchText(row).includes(term)) : rows;
  }

  private searchText(row: T): string {
    return this.searchColumns()
      .flatMap((column) => this.values(column, row))
      .join(' ')
      .toLowerCase();
  }
}

function compare(a: any, b: any, isDate: boolean): number {
  if (isDate || a instanceof Date || b instanceof Date) {
    return (new Date(a).getTime() || 0) - (new Date(b).getTime() || 0);
  }
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);

  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}
