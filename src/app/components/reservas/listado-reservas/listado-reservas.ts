import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageLayout } from '../../../shared/layout/page-layout/page-layout';
import { AppButton } from '../../../shared/components/button/button';
import { FilterPanel } from '../../../shared/components/filter-panel/filter-panel';
import { AppTable } from '../../../shared/components/table/table';
import { TableStateService } from '../../../shared/components/table/table-state.service';
import { FilterConfigProvider } from '../../../shared/services/filter-config.provider';
import { ReservasFilterService } from '../services/reservas-filter.service';
import { ReservasService } from '../services/reservas.service';
import { LoadDataFn, RowAction } from '../../../shared/components/table/table.models';
import { ReservaRow } from '../models/reserva.model';
import { ReservasColumnsService } from '../services/reserva-columns.service';
import { EstadoReserva } from '../../../shared';
import { ConfirmDialogService } from '../../../shared/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-listado-reservas',
  imports: [PageLayout, AppButton, FilterPanel, AppTable],
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
  private readonly confirmDialogService = inject(ConfirmDialogService);
  protected readonly tableState = inject(TableStateService);
  private readonly columnsService = inject(ReservasColumnsService);

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
    ...(row.requiereDocumentacion && !row.tieneDocumentacion
      ? [
          {
            label: 'Confirmar documentación',
            icon: 'pi pi-file-check',
            command: () => {
              this.confirmDialogService
                .open({
                  title: 'Confirmar documentación',
                  message:
                    '¿Confirmás que la documentación de esta reserva fue entregada y está correcta?',
                  variant: 'primary',
                })
                .subscribe((confirmed) => {
                  if (!confirmed) {
                    return;
                  }
                  this.reservasService.confirmarDocumentacion(row.id).subscribe({
                    next: () => this.recargarTabla(),
                  });
                });
            },
          } satisfies RowAction<ReservaRow>,
        ]
      : []),
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

  private recargarTabla(): void {
    this.tableState.reload();
  }
}
