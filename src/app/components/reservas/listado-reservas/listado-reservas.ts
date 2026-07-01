import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageLayout } from '../../../shared/layout/page-layout/page-layout';
import { AppButton } from '../../../shared/components/button/button';
import { FilterPanel } from '../../../shared/components/filter-panel/filter-panel';
import { AppTable } from '../../../shared/components/table/table';
import { TableStateService } from '../../../shared/components/table/table-state.service';
import { FilterConfigProvider } from '../../../shared/services/filter-config.provider';
import { ReservasFilterService } from '../services/reservas-filter.service';
import { ReservasService } from '../services/reservas.service';
import { LoadDataFn, RowAction } from '../../../shared/components/table/table.models';
import { ReservaRow, TipoReserva } from '../models/reserva.model';
import { ReservasColumnsService } from '../services/reserva-columns.service';
import { EstadoReserva } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { PagoReserva } from '../pago-reserva/pago-reserva';

@Component({
  selector: 'app-listado-reservas',
  imports: [PageLayout, AppButton, FilterPanel, AppTable, PagoReserva],
  providers: [
    TableStateService,
    ReservasService,
    ReservasColumnsService,
    { provide: FilterConfigProvider, useClass: ReservasFilterService },
  ],
  templateUrl: './listado-reservas.html',
  styleUrl: './listado-reservas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoReservas {
  private readonly reservasService = inject(ReservasService);
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly tableState = inject(TableStateService);
  private readonly columnsService = inject(ReservasColumnsService);

  protected readonly exportando = signal(false);
  protected readonly puedeExportar = computed(
    () => this.tableState.hasResults() && !this.tableState.loading() && !this.exportando(),
  );

  protected readonly reservaPagoSeleccionada = signal<ReservaRow | null>(null);
  protected readonly columns = this.columnsService.columns;

  protected readonly loadDataFn: LoadDataFn<ReservaRow> = (params) =>
    this.reservasService.getAll(params);

  protected readonly rowActions = (row: ReservaRow): RowAction<ReservaRow>[] => [
    {
      label: 'Ver detalle',
      icon: 'pi pi-eye',
      command: () => this.router.navigate(['/reservas', row.id]),
    },
    ...(row.estadoReserva === EstadoReserva.Pendiente ||
    row.estadoReserva === EstadoReserva.Confirmada
      ? [
          {
            label: 'Modificar',
            icon: 'pi pi-pencil',
            command: () =>
              this.router.navigate(['/reservas', row.id, 'modificar'], {
                queryParams: { from: 'listado' },
              }),
          } satisfies RowAction<ReservaRow>,
        ]
      : []),
    ...(this.puedeConfirmarPago(row)
      ? [
          {
            label: 'Confirmar pago',
            icon: 'pi pi-dollar',
            command: () => this.onConfirmarPago(row),
          } satisfies RowAction<ReservaRow>,
        ]
      : []),
    // { label: 'Eliminar', ... },
  ];

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  protected onSearchChange(search: string): void {
    this.tableState.updateFilters({ ...this.tableState.queryParams().filters, search });
  }

  protected onClearFilters(): void {
    this.tableState.updateFilters({});
  }

  protected onNuevaReserva(): void {
    this.router.navigate(['/reservas/nueva']);
  }

  protected onExportar(): void {
    if (!this.puedeExportar()) return;
    this.exportando.set(true);
    const filters = this.tableState.queryParams().filters;
    this.reservasService
      .exportar(filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.exportando.set(false),
        error: (err) => {
          this.exportando.set(false);
          this.errorHandler.handle(err);
        },
      });
  }

  protected onConfirmarPago(row: ReservaRow): void {
    this.reservaPagoSeleccionada.set(row);
  }

  protected onCerrarPagoReserva(): void {
    this.reservaPagoSeleccionada.set(null);
  }

  protected onPagoReservaRegistrado(): void {
    this.reservaPagoSeleccionada.set(null);
    this.recargarTabla();
  }

  private recargarTabla(): void {
    this.tableState.updateFilters({ ...this.tableState.queryParams().filters });
  }

  private puedeConfirmarPago(row: ReservaRow): boolean {
    return (
      !row.pago &&
      row.estadoReserva !== EstadoReserva.Finalizada &&
      row.estadoReserva !== EstadoReserva.Cancelada &&
      row.tipoReserva !== TipoReserva.ColaboracionSinFines
    );
  }
}
