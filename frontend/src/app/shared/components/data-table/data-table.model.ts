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

export interface ValueSource<T = any> {
  key: string;
  value?: (row: T) => any;
}

export interface TableColumn<T = any> extends ValueSource<T> {
  header: string;
  type?: TableColumnType;
  align?: TableAlign;
  cellClass?: string;
  headerClass?: string;
  badgeClass?: (row: T) => string;
  tagClass?: string;
  dateFormat?: string;
  imageAlt?: (row: T) => string;
  imageClass?: string;
  indexOrder?: 'asc' | 'desc';
  searchable?: boolean;
  sortable?: boolean;
}

export interface ViewColumn<T = any> extends TableColumn<T> {
  type: TableColumnType;
  sortable: boolean;
  thClass: string;
  thInnerClass: string;
  tdClass: string;
  thTitle: string | null;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface TableSortEvent {
  key: string;
  direction: SortDirection;
}

export interface TableAction<T = any> {
  id: string;
  icon: string;
  label: string;
  class?: string;
  hidden?: (row: T) => boolean;
}

export interface TableActionEvent<T = any> {
  id: string;
  row: T;
}

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
  value: string;
  label: string;
}

export interface TableFilter<T = any> extends ValueSource<T> {
  label: string;
  type?: 'checkbox' | 'date';
  options?: TableFilterOption[];
}

export interface TableCellContext {
  $implicit: any;
  column: TableColumn;
  index: number;
}
