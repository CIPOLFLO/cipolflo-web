import { Observable } from 'rxjs';

export type CellType = 'text' | 'tag' | 'amount' | 'price' | 'date';

export interface TagStyle {
  styleClass: string;
  label?: string;
}

interface BaseColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  unitKey?: string;
  nullFallback?: string;
  transform?: (value: unknown) => string;
}

export type ColumnConfig =
  | (BaseColumnConfig & { cellType?: 'text' | 'amount' | 'date' })
  | (BaseColumnConfig & { cellType: 'tag'; tagMap: Record<string, TagStyle> })
  | (BaseColumnConfig & { cellType: 'price'; colorVariant?: 'green' });

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
