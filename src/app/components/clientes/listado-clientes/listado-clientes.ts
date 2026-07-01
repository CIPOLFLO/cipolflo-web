import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { filter, switchMap } from 'rxjs';
import {
  AppButton,
  AppTable,
  ConfirmDialogService,
  FilterConfigProvider,
  FilterPanel,
  LoadDataFn,
  PageLayout,
  RowAction,
  TableStateService,
  TableExportService,
} from '../../../shared';
import { ClientesColumnsService } from '../services/cliente-columns.service';
import { ClientesFilterService } from '../services/cliente-filter.service';
import { ClientesService } from '../services/cliente.service';
import { ClienteRespuestaDto, TipoCliente, EstadoSocio } from '../models/cliente.model';
import { Router } from '@angular/router';
import { PagoCuota } from '../pago-cuota/pago-cuota';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { BreakpointService } from '../../../core/services/breakpoint.service';

@Component({
  selector: 'app-listado-clientes',
  imports: [PageLayout, AppButton, FilterPanel, AppTable, PagoCuota],
  providers: [
    TableStateService,
    TableExportService,
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
  private readonly confirmDialogService = inject(ConfirmDialogService);
  protected readonly tableState = inject(TableStateService);
  protected readonly tableExport = inject(TableExportService);
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlerService);
  protected readonly breakpoint = inject(BreakpointService);
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
    ...(row.tipoCliente === TipoCliente.Socio &&
    row.estado !== null &&
    row.estado !== EstadoSocio.Baja
      ? [
          {
            label: 'Pago de cuota',
            icon: 'pi pi-dollar',
            command: () => this.onPagoCuota(row),
          },
        ]
      : []),
    {
      label: 'Modificar',
      icon: 'pi pi-pencil',
      command: () =>
        this.router.navigate(['/clientes', row.id, 'modificar'], {
          queryParams: { from: 'listado' },
        }),
    },
    ...(row.estado !== EstadoSocio.Baja
      ? [
          {
            label: 'Nueva Reserva',
            icon: 'pi pi-calendar',
            command: () =>
              this.router.navigate(['/reservas/nueva'], { queryParams: { clienteId: row.id } }),
          },
        ]
      : []),
    ...(row.tipoCliente === TipoCliente.Socio && row.estado !== EstadoSocio.Baja
      ? [{ label: 'Dar de baja', icon: 'pi pi-trash', command: () => this.onDarDeBajaCliente(row) }]
      : []),
  ];

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  protected onApplyFilters(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  protected onSearchChange(search: string): void {
    this.tableState.updateFilters({ ...this.tableState.queryParams().filters, search });
  }

  protected onClearFilters(): void {
    this.tableState.updateFilters({});
  }

  protected onNuevoCliente(): void {
    this.router.navigate(['/clientes/nuevo']);
  }

  protected onPagoCuota(cliente: ClienteRespuestaDto): void {
    this.clientePagoSeleccionado.set(cliente);
  }

  protected onCerrarPagoCuota(): void {
    this.clientePagoSeleccionado.set(null);
    this.recargarTabla();
  }

  protected onExportar(): void {
    const filters = this.tableState.queryParams().filters;
    this.tableExport.exportar(() => this.clientesService.exportar(filters));
  }

  protected onDarDeBajaCliente(cliente: ClienteRespuestaDto): void {
    this.confirmDialogService
      .open({
        title: 'Dar de baja cliente',
        message:
          '¿Confirma que quiere dar de baja este cliente? Si tiene reservas futuras, se cancelarán, incluso las que ya están pagas.',
        confirmButtonLabel: 'Dar de baja',
        cancelButtonLabel: 'Cancelar',
        variant: 'danger',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.clientesService.darDeBaja(cliente.id)),
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
