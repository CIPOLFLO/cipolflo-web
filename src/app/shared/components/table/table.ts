import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs';
import { TableModule } from 'primeng/table';
import { SortEvent } from 'primeng/api';
import { ColumnConfig, EMPTY_PAGE, LoadDataFn, PageResponse, RowAction, TagStyle } from './table.models';
import { TableStateService } from './table-state.service';
import { TagCellComponent } from './cells/tag-cell/tag-cell';
import { AmountCellComponent } from './cells/amount-cell/amount-cell';
import { PriceCellComponent } from './cells/price-cell/price-cell';
import { RowActionsComponent } from './cells/row-actions/row-actions';
import { PaginationComponent } from './pagination/pagination';
import { DateFormatPipe } from './pipes/date-format.pipe';

/**
 * Tabla genérica reutilizable con paginación, ordenamiento y filtros.
 *
 * **Requisito de DI:** el componente padre debe proveer `TableStateService`
 * en su propio `providers` para que `AppTable` y `FilterPanel` compartan
 * el mismo estado. Ejemplo:
 * ```ts
 * @Component({ providers: [TableStateService, { provide: FilterConfigProvider, useClass: MiFilterService }] })
 * ```
 */
@Component({
  selector: 'app-table',
  imports: [
    TableModule,
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

  private readonly params$ = toObservable(this.tableState.queryParams);

  protected readonly tableData = toSignal(
    this.params$.pipe(
      switchMap((params) => {
        this.loading.set(true);
        return this.loadDataFn()(params).pipe(finalize(() => this.loading.set(false)));
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

  protected getNumber(val: unknown): number {
    return typeof val === 'number' ? val : 0;
  }

  protected getTagMap(col: ColumnConfig): Record<string, TagStyle> {
    return col.cellType === 'tag' ? col.tagMap : {};
  }

  protected getRowActionsForRow(row: T): RowAction<T>[] {
    return this.getRowActions()?.(row) ?? [];
  }
}
