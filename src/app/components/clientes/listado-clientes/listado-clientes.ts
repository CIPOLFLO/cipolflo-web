import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, combineLatest, filter, map, of, switchMap } from 'rxjs';
import {
  AppButton,
  AppTable,
  ConfirmDialogService,
  FilterConfigProvider,
  FilterPanel,
  LoadDataFn,
  PageLayout,
  RowAction,
  TableExportService,
  TableStateService,
} from '../../../shared';

import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

import { MobFab } from '../../../shared/mobile/components/fab/mob-fab';
import { MobFilterPanel } from '../../../shared/mobile/components/filter-panel/mob-filter-panel';
import { MobListCard } from '../../../shared/mobile/components/list-card/mob-list-card';

import { ClienteListadoRow, mapClienteListadoRow } from '../mappers/cliente-listado.mapper';
import { ClienteRespuestaDto, EstadoSocio, TipoCliente } from '../models/cliente.model';
import { PagoCuota } from '../pago-cuota/pago-cuota';
import { ClientesColumnsService } from '../services/cliente-columns.service';
import { ClientesFilterService } from '../services/cliente-filter.service';
import { ClientesService } from '../services/cliente.service';

@Component({
  selector: 'app-listado-clientes',
  imports: [
    PageLayout,
    AppButton,
    FilterPanel,
    AppTable,
    PagoCuota,
    MobFilterPanel,
    MobListCard,
    MobFab,
  ],
  providers: [
    TableStateService,
    TableExportService,
    ClientesColumnsService,
    {
      provide: FilterConfigProvider,
      useClass: ClientesFilterService,
    },
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
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly tableState = inject(TableStateService);
  protected readonly tableExport = inject(TableExportService);
  protected readonly breakpoint = inject(BreakpointService);

  protected readonly clientePagoSeleccionado = signal<ClienteRespuestaDto | null>(null);

  constructor() {
    const defaults = Object.fromEntries(
      this.filterConfigProvider
        .filterFields()
        .filter((field) => field.defaultValue != null)
        .map((field) => [field.key, field.defaultValue!]),
    );

    if (Object.keys(defaults).length) {
      this.tableState.updateFilters(defaults);
    }
  }

  protected readonly columns = this.columnsService.columns;

  protected readonly loadDataFn: LoadDataFn<ClienteListadoRow> = (params) =>
    this.clientesService.getAll(params).pipe(
      map((page) => ({
        ...page,
        content: page.content.map(mapClienteListadoRow),
      })),
    );

  /**
   * Carga los clientes para la vista móvil.
   *
   * La consulta se ejecuta solamente cuando la pantalla es móvil
   * y vuelve a ejecutarse cuando cambian los filtros.
   */
  protected readonly mobilePage = toSignal(
    combineLatest([
      toObservable(this.breakpoint.isMobile),
      toObservable(this.tableState.queryParams),
    ]).pipe(
      switchMap(([isMobile, params]) => {
        if (!isMobile) {
          return of(null);
        }

        return this.clientesService.getAll(params).pipe(
          catchError((error) => {
            this.errorHandler.handle(error);
            return of(null);
          }),
        );
      }),
    ),
    {
      initialValue: null,
    },
  );

  /**
   * Lista de clientes que utiliza el HTML móvil.
   */
  protected readonly mobileClientes = computed<ClienteRespuestaDto[]>(
    () => this.mobilePage()?.content ?? [],
  );

  protected readonly rowActions = (row: ClienteRespuestaDto): RowAction<ClienteRespuestaDto>[] => [
    // TODO: temporal — habilitar cuando existan
    // GET detalle / PUT modificación de Empresa
    ...(row.tipoCliente !== TipoCliente.Empresa
      ? [
          {
            label: 'Ver detalle',
            icon: 'pi pi-eye',
            command: () => this.router.navigate(['/clientes', row.id]),
          },
        ]
      : []),

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

    // TODO: temporal — habilitar cuando existan
    // GET detalle / PUT modificación de Empresa
    ...(row.tipoCliente !== TipoCliente.Empresa
      ? [
          {
            label: 'Modificar',
            icon: 'pi pi-pencil',
            command: () =>
              this.router.navigate(['/clientes', row.id, 'modificar'], {
                queryParams: {
                  from: 'listado',
                },
              }),
          },
        ]
      : []),

    ...(row.estado !== EstadoSocio.Baja
      ? [
          {
            label: 'Nueva Reserva',
            icon: 'pi pi-calendar',
            command: () =>
              this.router.navigate(['/reservas/nueva'], {
                queryParams: {
                  clienteId: row.id,
                },
              }),
          },
        ]
      : []),

    ...(row.tipoCliente === TipoCliente.Socio && row.estado !== EstadoSocio.Baja
      ? [
          {
            label: 'Dar de baja',
            icon: 'pi pi-trash',
            command: () => this.onDarDeBajaCliente(row),
          },
        ]
      : []),
  ];

  /**
   * Filtros del listado de escritorio.
   */
  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  /**
   * Filtros aplicados desde MobFilterPanel.
   */
  protected onApplyFilters(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  /**
   * Limpia los filtros móviles.
   */
  protected onClearFilters(): void {
    this.tableState.updateFilters({});
  }

  protected onNuevoCliente(): void {
    this.router.navigate(['/clientes/nuevo']);
  }

  protected onNuevaEmpresa(): void {
    this.router.navigate(['/clientes/nueva-empresa']);
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
        error: (error) => {
          this.errorHandler.handle(error);
        },
      });
  }

  /**
   * Texto superior de la tarjeta móvil.
   */
  protected clienteReferencia(cliente: ClienteRespuestaDto): string {
    if (cliente.numeroSocio !== null) {
      return String(cliente.numeroSocio);
    }

    switch (cliente.tipoCliente) {
      case TipoCliente.Socio:
        return 'Socio';

      case TipoCliente.Particular:
        return 'Particular';

      case TipoCliente.Empresa:
        return 'Empresa';
    }
  }

  /**
   * Devuelve la cédula o el RUT.
   */
  protected clienteDocumento(cliente: ClienteRespuestaDto): string {
    return cliente.cedula ?? cliente.rut ?? 'Sin documento';
  }

  /**
   * Devuelve el estado o tipo mostrado en la insignia.
   */
  protected clienteEstadoLabel(cliente: ClienteRespuestaDto): string {
    switch (cliente.estado) {
      case EstadoSocio.Activo:
        return 'Activo';

      case EstadoSocio.Inactivo:
        return 'Inactivo';

      case EstadoSocio.Baja:
        return 'De baja';

      default:
        return this.tipoClienteLabel(cliente.tipoCliente);
    }
  }

  protected tipoClienteLabel(tipoCliente: TipoCliente): string {
    switch (tipoCliente) {
      case TipoCliente.Socio:
        return 'Socio';

      case TipoCliente.Particular:
        return 'Particular';

      case TipoCliente.Empresa:
        return 'Empresa';
    }
  }

  private recargarTabla(): void {
    this.tableState.updateFilters({
      ...this.tableState.queryParams().filters,
    });
  }
}
