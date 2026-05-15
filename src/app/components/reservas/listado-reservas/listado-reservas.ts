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
import { ColumnConfig, LoadDataFn, RowAction } from '../../../shared/components/table/table.models';
import { ReservaRow } from '../models/reserva.model';

@Component({
  selector: 'app-listado-reservas',
  imports: [PageLayout, AppButton, FilterPanel, AppTable],
  providers: [
    TableStateService,
    ReservasService,
    { provide: FilterConfigProvider, useClass: ReservasFilterService },
  ],
  templateUrl: './listado-reservas.html',
  styleUrl: './listado-reservas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoReservas {
  private readonly reservasService = inject(ReservasService);
  private readonly router = inject(Router);
  protected readonly tableState = inject(TableStateService);

  protected readonly columns: ColumnConfig[] = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'servicio', label: 'Servicio', sortable: true },
    { key: 'fechaDesde', label: 'Fecha Desde', sortable: true, cellType: 'date' },
    { key: 'fechaHasta', label: 'Fecha Hasta', cellType: 'date' },
    {
      key: 'estado',
      label: 'Estado',
      cellType: 'tag',
      tagMap: {
        CONFIRMADA: { styleClass: 'tag--green', label: 'Confirmada' },
        EN_CURSO: { styleClass: 'tag--blue', label: 'En curso' },
        FINALIZADA: { styleClass: 'tag--purple', label: 'Finalizada' },
        CANCELADA: { styleClass: 'tag--gray', label: 'Cancelada' },
        PENDIENTE: { styleClass: 'tag--yellow', label: 'Pendiente' },
      },
    },
  ];

  protected readonly loadDataFn: LoadDataFn<ReservaRow> = (params) =>
    this.reservasService.getDatos(params);

  protected readonly rowActions = (row: ReservaRow): RowAction<ReservaRow>[] => [
    {
      label: 'Ver detalle',
      icon: 'pi pi-eye',
      command: () => this.router.navigate(['/reservas', row.id]),
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => console.log('Editar', row.id),
    },
  ];

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }
}
