import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, filter, switchMap } from 'rxjs';
import {
  AppButton,
  AppTable,
  FilterConfigProvider,
  FilterPanel,
  LoadDataFn,
  PageLayout,
  RowAction,
  TableStateService,
  ConfirmDialogService,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzasColumnsService } from '../services/finanzas-columns.service';
import { FinanzasFilterService } from '../services/finanzas-filter.service';
import { FinanzaService } from '../services/finanza.service';
import { FinanzaRow, TipoMovimiento } from '../models/finanza.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-finanzas',
  imports: [PageLayout, FilterPanel, AppTable, AppButton],
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
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);

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
    {
      label: 'Modificar',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/finanzas', row.id, 'editar']),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      command: () => this.onEliminarFinanza(row),
    },
  ];

  protected onNuevoMovimiento(): void {
    this.router.navigate(['/finanzas', 'nuevo']);
  }

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  protected onEliminarFinanza(finanza: FinanzaRow): void {
    this.confirmDialogService
      .open({
        title: 'Eliminar movimiento',
        message: '¿Confirma que quiere eliminar este movimiento financiero?',
        confirmButtonLabel: 'Eliminar',
        cancelButtonLabel: 'Cancelar',
        variant: 'danger',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.finanzaService.eliminar(finanza.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.recargarTabla(),
        error: (err) => {
          this.errorHandler.handle(err);
        },
      });
  }

  private recargarTabla(): void {
    this.tableState.updateFilters({ ...this.tableState.queryParams().filters });
  }
}
