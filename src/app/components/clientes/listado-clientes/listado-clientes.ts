import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { ClientesColumnsService } from '../services/clientes-columns.service';
import { ClientesFilterService } from '../services/clientes-filter.service';
import { ClientesService } from '../services/clientes.service';
import { ClienteRespuestaDto } from '../models/cliente.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-listado-clientes',
  imports: [PageLayout, AppButton, FilterPanel, AppTable],
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
}
