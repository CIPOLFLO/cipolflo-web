import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { filter, switchMap } from 'rxjs';
import {
  AppButton,
  AppTable,
  ConfirmDialogService,
  FilterConfigProvider,
  FilterPanel,
  LoadDataFn,
  MobPageHeader,
  PageLayout,
  RowAction,
  TableStateService,
} from '../../../shared';
import { ClienteRespuestaDto, EstadoSocio, TipoCliente } from '../models/cliente.model';
import { PagoCuota } from '../pago-cuota/pago-cuota';
import { ClientesColumnsService } from '../services/cliente-columns.service';
import { ClientesFilterService } from '../services/cliente-filter.service';
import { ClientesService } from '../services/cliente.service';
import { ClienteRespuestaDto, TipoCliente, EstadoSocio } from '../models/cliente.model';
import { Router } from '@angular/router';
import { PagoCuota } from '../pago-cuota/pago-cuota';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-listado-clientes',
  imports: [PageLayout, AppButton, FilterPanel, AppTable, PagoCuota, MobPageHeader],
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
  private readonly confirmDialogService = inject(ConfirmDialogService);
  protected readonly tableState = inject(TableStateService);
  private readonly router = inject(Router);
  protected readonly breakpoint = inject(BreakpointService);
  protected readonly userService = inject(UserService);
  protected readonly clientePagoSeleccionado = signal<ClienteRespuestaDto | null>(null);
  private readonly errorHandler = inject(ErrorHandlerService);

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
    this.clientesService.getAll(params).pipe(
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
    ...(row.tipoCliente === TipoCliente.Socio && row.estado !== EstadoSocio.Baja
      ? [{ label: 'Dar de baja', icon: 'pi pi-trash', command: () => this.onDarDeBajaCliente(row) }]
      : []),
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
