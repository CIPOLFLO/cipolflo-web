import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import {
  AppTable,
  FilterConfigProvider,
  FilterPanel,
  LoadDataFn,
  PageLayout,
  RowAction,
  TableStateService,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzasColumnsService } from '../services/finanzas-columns.service';
import { FinanzasFilterService } from '../services/finanzas-filter.service';
import { FinanzaService } from '../services/finanza.service';
import { FinanzaRow, TipoMovimiento } from '../models/finanza.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-finanzas',
  imports: [PageLayout, FilterPanel, AppTable],
  providers: [
    TableStateService,
    FinanzasColumnsService,
    { provide: FilterConfigProvider, useClass: FinanzasFilterService },
  ],
  templateUrl: './listado-finanzas.html',
  styleUrls: ['./listado-finanzas.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoFinanzas {
  private readonly finanzaService = inject(FinanzaService);
  private readonly columnsService = inject(FinanzasColumnsService);
  private readonly filterConfigProvider = inject(FilterConfigProvider);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly router = inject(Router);
  protected readonly tableState = inject(TableStateService);

  constructor() {
    const defaults = Object.fromEntries(
      this.filterConfigProvider
        .filterFields()
        .filter((f) => f.defaultValue != null)
        .map((f) => [f.key, f.defaultValue!]),
    );
    if (Object.keys(defaults).length) {
      this.tableState.updateFilters(defaults);
    }
  }

  protected readonly columns = this.columnsService.columns;

  protected readonly loadDataFn: LoadDataFn<FinanzaRow> = (params) =>
    this.finanzaService.getAll(params).pipe(
      map((response) => ({
        ...response,
        content: response.content.map((dto) => ({
          id: dto.id,
          concepto: dto.concepto,
          fecha: dto.fecha,
          importeSignado: dto.tipoMovimiento === TipoMovimiento.Egreso ? -dto.importe : dto.importe,
          descripcion: dto.descripcion,
        })),
      })),
      catchError((err) => {
        this.errorHandler.handle(err);
        return of({
          content: [],
          page: params.page,
          size: params.size,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
        });
      }),
    );

  protected readonly rowActions = (row: FinanzaRow): RowAction<FinanzaRow>[] => [
    {
      label: 'Ver detalle',
      icon: 'pi pi-eye',
      command: () => this.router.navigate(['/finanzas', row.id]),
    },
  ];

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }
}
