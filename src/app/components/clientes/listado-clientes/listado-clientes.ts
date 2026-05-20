import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PageLayout } from '../../../shared/layout/page-layout/page-layout';
import { AppButton } from '../../../shared/components/button/button';
import { FilterPanel } from '../../../shared/components/filter-panel/filter-panel';
import { AppTable } from '../../../shared/components/table/table';
import { TableStateService } from '../../../shared/components/table/table-state.service';
import { FilterConfigProvider } from '../../../shared/services/filter-config.provider';
import { ClientesFilterService } from '../services/cliente-filter.service';
import { ClienteService } from '../services/clientes.service';
import { ColumnConfig, LoadDataFn, RowAction } from '../../../shared/components/table/table.models';
import { ClienteRow } from '../models/cliente.model';

@Component({
  selector: 'app-listado-clientes',
  imports: [PageLayout, AppButton, FilterPanel, AppTable],
  providers: [
    TableStateService,
    ClienteService,
    { provide: FilterConfigProvider, useClass: ClientesFilterService },
  ],
  templateUrl: './listado-clientes.html',
  styleUrl: './listado-clientes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoClientes {
  private readonly clienteService = inject(ClienteService);
  private readonly router = inject(Router);
  protected readonly tableState = inject(TableStateService);

  protected readonly columns: ColumnConfig[] = [
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'numeroSocio', label: 'Nro de socio' },
    { key: 'cedula', label: 'Cédula' },
    { key: 'email', label: 'Email' },
    {
      key: 'estado',
      label: 'Estado',
      cellType: 'tag',
      tagMap: {
        ACTIVO: { styleClass: 'tag--green', label: 'Activo' },
        INACTIVO: { styleClass: 'tag--yellow', label: 'Inactivo' },
        BAJA: { styleClass: 'tag--gray', label: 'De baja' },
      },
    },
  ];

  protected readonly loadDataFn: LoadDataFn<ClienteRow> = (params) =>
    this.clienteService.getDatos(params);

  protected readonly rowActions = (row: ClienteRow): RowAction<ClienteRow>[] => [
    {
      label: 'Ver detalle',
      icon: 'pi pi-eye',
      command: () => this.router.navigate(['/clientes', row.id]),
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => console.log('Editar', row.id),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      command: () => console.log('Eliminar', row.id),
    },
    {
      label: 'Pago de cuota',
      icon: 'pi pi-dollar',
      command: () => console.log('Pago de cuota', row.id),
    },
    {
      label: 'Nueva Reserva',
      icon: 'pi pi-calendar',
      command: () => console.log('Reserva', row.id),
    },
  ];

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }
}
