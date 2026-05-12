import { Observable } from 'rxjs';

export type CellType = 'text' | 'tag' | 'amount' | 'price' | 'date';

export interface TagStyle {
  styleClass: string;
  label?: string;
}

export interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  cellType?: CellType;
  tagMap?: Record<string, TagStyle>;
  unitKey?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface TableQueryParams {
  filters: Record<string, string | null>;
  page: number;
  size: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RowAction<T = unknown> {
  label: string;
  icon?: string;
  command?: (row: T) => void;
  disabled?: boolean | ((row: T) => boolean);
  separator?: boolean;
}

export type LoadDataFn<T> = (params: TableQueryParams) => Observable<PageResponse<T>>;

export const EMPTY_PAGE: PageResponse<never> = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};
