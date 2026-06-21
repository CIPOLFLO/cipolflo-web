import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, map, switchMap, timer, tap } from 'rxjs';
import { TableModule } from 'primeng/table';
import { Skeleton } from 'primeng/skeleton';
import { SortEvent } from 'primeng/api';

import {
  ColumnConfig,
  EMPTY_PAGE,
  LoadDataFn,
  PageResponse,
  RowAction,
  TagStyle,
} from './table.models';
import { TableStateService } from './table-state.service';
import { TABLE_MIN_LOADING_MS, TABLE_SKELETON_ROW_COUNT } from '../../config/table.config';
import { TagCellComponent } from './cells/tag-cell/tag-cell';
import { AmountCellComponent } from './cells/amount-cell/amount-cell';
import { PriceCellComponent } from './cells/price-cell/price-cell';
import { RowActionsComponent } from './cells/row-actions/row-actions';
import { PaginationComponent } from './pagination/pagination';
import { DateFormatPipe } from './pipes/date-format.pipe';

@Component({
  selector: 'app-table',
  imports: [
    TableModule,
    Skeleton,
    TagCellComponent,
    AmountCellComponent,
    PriceCellComponent,
    RowActionsComponent,
    PaginationComponent,
    DateFormatPipe,
  ],
  templateUrl: './table.html',
  styleUrl: './table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTable<T extends Record<string, unknown>> implements OnInit {
  columns = input.required<ColumnConfig[]>();
  loadDataFn = input.required<LoadDataFn<T>>();
  getRowActions = input<((row: T) => RowAction<T>[]) | null>(null);
  pageSize = input<number>(10);
  pageSizeOptions = input<number[]>([10, 25, 50, 100]);

  protected readonly tableState = inject(TableStateService);
  protected readonly loading = signal(false);

  private readonly minLoadingMs = inject(TABLE_MIN_LOADING_MS);
  private readonly skeletonRowCount = inject(TABLE_SKELETON_ROW_COUNT);
  protected readonly skeletonRows = Array.from({ length: this.skeletonRowCount }, (_, i) => i);
  private readonly params$ = toObservable(this.tableState.queryParams);

  protected readonly tableData = toSignal(
    this.params$.pipe(
      switchMap((params) => {
        this.loading.set(true);
        this.tableState.setLoading(true);
        const data$ = this.loadDataFn()(params);
        const bounded$ =
          this.minLoadingMs > 0
            ? forkJoin([data$, timer(this.minLoadingMs)]).pipe(map(([data]) => data))
            : data$;
        return bounded$.pipe(
          tap((data) => this.tableState.setResult(data.totalElements)),
          finalize(() => {
            this.loading.set(false);
            this.tableState.setLoading(false);
          }),
        );
      }),
    ),
    { initialValue: EMPTY_PAGE as PageResponse<T> },
  );

  ngOnInit(): void {
    const initial = this.pageSize();
    if (initial !== this.tableState.queryParams().size) {
      this.tableState.updateSize(initial);
    }
  }

  protected onSort(event: SortEvent): void {
    if (event.field && (event.order === 1 || event.order === -1)) {
      this.tableState.updateSort(event.field, event.order === -1 ? 'desc' : 'asc');
    } else {
      this.tableState.clearSort();
    }
  }

  protected get sortFieldOrDefault(): string {
    return this.tableState.queryParams().sortField ?? '';
  }

  protected getString(val: unknown): string {
    return val == null ? '' : String(val);
  }

  protected getTextValue(col: ColumnConfig, val: unknown): string {
    if (val == null) return col.nullFallback ?? '';
    return col.transform ? col.transform(val) : String(val);
  }

  protected getNumber(val: unknown): number {
    return typeof val === 'number' ? val : 0;
  }

  protected getTagCellValue(col: ColumnConfig, val: unknown): string {
    if (val == null) return col.nullFallback ?? '';
    return String(val);
  }

  protected getTagMap(col: ColumnConfig): Record<string, TagStyle> {
    return col.cellType === 'tag' ? col.tagMap : {};
  }

  protected getPriceColorVariant(col: ColumnConfig): 'green' | undefined {
    return col.cellType === 'price' ? col.colorVariant : undefined;
  }

  protected getRowActionsForRow(row: T): RowAction<T>[] {
    return this.getRowActions()?.(row) ?? [];
  }
}
