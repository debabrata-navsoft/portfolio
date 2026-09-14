/** Cell renderers the table can draw on its own, without a custom template. */
export type TableColumnType =
  | 'index'
  | 'text'
  | 'image'
  | 'date'
  | 'timeAgo'
  | 'badge'
  | 'tags'
  | 'progress';

export type TableAlign = 'left' | 'center' | 'right';

/** Anything that can pull a value out of a row — columns and filters both do. */
export interface ValueSource<T = any> {
  /** Unique id. Doubles as the default row accessor and as the custom-template key. */
  key: string;
  /** Pulls the value out of a row. Defaults to `row[key]`. */
  value?: (row: T) => any;
}

export interface TableColumn<T = any> extends ValueSource<T> {
  header: string;
  /** Defaults to 'text'. */
  type?: TableColumnType;
  align?: TableAlign;
  /** Extra classes for the `<td>` / `<th>`. */
  cellClass?: string;
  headerClass?: string;
  /** `badge` columns — pill classes for this row. */
  badgeClass?: (row: T) => string;
  /** `tags` columns — pill classes shared by every tag. */
  tagClass?: string;
  /** `date` columns — DatePipe format. Defaults to 'dd MMM yyyy'. */
  dateFormat?: string;
  /** `image` columns. */
  imageAlt?: (row: T) => string;
  imageClass?: string;
  /** `index` columns — 'asc' (the default) numbers from 1 upwards. */
  indexOrder?: 'asc' | 'desc';
  /** Set false to keep the column out of the toolbar search. */
  searchable?: boolean;
  /** Set false to disable sorting for this column. Defaults to true for sortable column types. */
  sortable?: boolean;
}

/**
 * A `TableColumn` with everything the template would otherwise recompute on
 * every change-detection pass resolved once. Built by `DataTable.viewColumns`.
 */
export interface ViewColumn<T = any> extends TableColumn<T> {
  type: TableColumnType;
  sortable: boolean;
  /** Ready-built class strings for the header cell, its inner flex box and the body cell. */
  thClass: string;
  thInnerClass: string;
  tdClass: string;
  /** Header tooltip, null when the column can't be sorted. */
  thTitle: string | null;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface TableSortEvent {
  key: string;
  direction: SortDirection;
}

export interface TableAction<T = any> {
  /** Emitted back on the `action` output. */
  id: string;
  /** Lucide icon name — it must be in the `pick` list in app.config.ts. */
  icon: string;
  /** Used as the button's aria-label and title. */
  label: string;
  /** Button classes. Defaults to `tbl-action-<id>`. */
  class?: string;
  hidden?: (row: T) => boolean;
}

export interface TableActionEvent<T = any> {
  id: string;
  row: T;
}

/** The three actions every admin list offers. `noun` fills the aria-label. */
export const viewAction = (noun: string, icon = 'link-2'): TableAction => ({
  id: 'view',
  icon,
  label: `View ${noun}`,
  class: 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200',
});

export const editAction = (noun: string): TableAction => ({
  id: 'edit',
  icon: 'square-pen',
  label: `Edit ${noun}`,
  class: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
});

export const deleteAction = (noun: string): TableAction => ({
  id: 'delete',
  icon: 'trash-2',
  label: `Delete ${noun}`,
  class: 'bg-red-100 text-red-600 hover:bg-red-200',
});

export interface TableFilterOption {
  /** Lower-cased — it is what the table matches on. */
  value: string;
  label: string;
}

export interface TableFilter<T = any> extends ValueSource<T> {
  label: string;
  /** Filter input type. Defaults to 'checkbox'. */
  type?: 'checkbox' | 'date';
  /** Fixed options. When omitted they are derived from the rows. Counts are always derived. */
  options?: TableFilterOption[];
}

/** Context handed to a custom cell template (`let-row` binds `$implicit`). */
export interface TableCellContext {
  $implicit: any;
  column: TableColumn;
  index: number;
}
