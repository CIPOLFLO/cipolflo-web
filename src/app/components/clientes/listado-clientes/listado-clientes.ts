import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AppButton,
  AppTable,
  FilterConfigProvider,
  FilterPanel,
  LoadDataFn,
  PageLayout,
  RowAction,
  TableStateService,
} from '../../../shared';
import { ClientesColumnsService } from '../services/cliente-columns.service';
import { ClientesFilterService } from '../services/cliente-filter.service';
import { ClientesService } from '../services/cliente.service';
import { ClienteRespuestaDto, TipoCliente } from '../models/cliente.model';
import { Router } from '@angular/router';
import { PagoCuota } from '../pago-cuota/pago-cuota';

@Component({
  selector: 'app-listado-clientes',
  imports: [PageLayout, AppButton, FilterPanel, AppTable, PagoCuota],
  providers: [
    TableStateService,
    ClientesColumnsService,
    { provide: FilterConfigProvider, useClass: ClientesFilterService },
  ],
  templateUrl: './listado-clientes.html',
  styleUrls: ['./listado-clientes.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoClientes {
  private readonly clientesService = inject(ClientesService);
  private readonly columnsService = inject(ClientesColumnsService);
  private readonly filterConfigProvider = inject(FilterConfigProvider);
  protected readonly tableState = inject(TableStateService);
  private readonly router = inject(Router);
  protected readonly clientePagoSeleccionado = signal<ClienteRespuestaDto | null>(null);

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

  protected readonly loadDataFn: LoadDataFn<ClienteRespuestaDto> = (params) =>
    this.clientesService.getAll(params);

  protected readonly rowActions = (row: ClienteRespuestaDto): RowAction<ClienteRespuestaDto>[] => [
    {
      label: 'Ver detalle',
      icon: 'pi pi-eye',
      command: () => this.router.navigate(['/clientes', row.id]),
    },
    ...(row.tipoCliente === TipoCliente.Socio
      ? [
          {
            label: 'Pago de cuota',
            icon: 'pi pi-dollar',
            command: () => this.onPagoCuota(row),
          },
        ]
      : []),
    // { label: 'Modificar',     icon: 'pi pi-pencil',        command: () => console.log('modificar', row.id) },

    // ...(row.estado !== 'ACTIVO'
    //   ? [{ label: 'Activar',    icon: 'pi pi-check-circle', command: () => console.log('activar', row.id) }]
    //   : [{ label: 'Desactivar', icon: 'pi pi-ban',          command: () => console.log('desactivar', row.id) }]),
    // { label: 'Pago de cuota', icon: 'pi pi-dollar',       command: () => console.log('pago cuota', row.id) },
    // { label: 'Nueva Reserva', icon: 'pi pi-calendar',     command: () => console.log('nueva reserva', row.id) },
    // { label: 'Eliminar',      icon: 'pi pi-trash',        command: () => console.log('eliminar', row.id) },
  ];

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  protected onNuevoCliente(): void {
    this.router.navigate(['/clientes/nuevo']);
  }

  protected onPagoCuota(cliente: ClienteRespuestaDto): void {
    this.clientePagoSeleccionado.set(cliente);
  }

  protected onCerrarPagoCuota(): void {
    this.clientePagoSeleccionado.set(null);
  }
}
