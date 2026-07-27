import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import {
  AppButton,
  AppTable,
  ConfirmDialogService,
  FilterConfigProvider,
  FilterPanel,
  LoadDataFn,
  MobFilterPanel,
  MobInfiniteScroll,
  MobileListLoader,
  MobListLayout,
  MobPageHeader,
  PageLayout,
  RowAction,
  TableExportService,
  TableStateService,
} from '../../../shared';

import { BreakpointService } from '../../../core/services/breakpoint.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { SidebarService } from '../../../core/services/sidebar.service';

import { MobClienteCard } from '../mob-cliente-card/mob-cliente-card';
import {
  ClienteCardMobileRow,
  ClienteListadoRow,
  mapClienteCardMobileRow,
  mapClienteListadoRow,
} from '../mappers/cliente-listado.mapper';
import { ClienteRespuestaDto, EstadoSocio, TipoCliente } from '../models/cliente.model';
import { ImportacionSociosResponseDto } from '../models/importacion-socios.model';
import { ImportarClientesDialog } from '../importar-clientes-dialog/importar-clientes-dialog';
import { ImportarClientesErrorDialog } from '../importar-clientes-error-dialog/importar-clientes-error-dialog';
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
    ImportarClientesDialog,
    ImportarClientesErrorDialog,
    MobPageHeader,
    MobListLayout,
    MobFilterPanel,
    MobClienteCard,
    MobInfiniteScroll,
  ],
  providers: [
    TableStateService,
    TableExportService,
    ClientesColumnsService,
    MobileListLoader,
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
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tableState = inject(TableStateService);
  protected readonly tableExport = inject(TableExportService);
  protected readonly breakpoint = inject(BreakpointService);
  protected readonly sidebar = inject(SidebarService);

  /**
   * Listado móvil con scroll infinito; reutiliza el mismo estado que la tabla de escritorio.
   * El servicio es genérico pero se provee por token, que no conserva el parámetro de tipo:
   * el cast fija `T` a la fila de la card (no es `any`).
   */
  protected readonly mobileList = inject(
    MobileListLoader,
  ) as MobileListLoader<ClienteCardMobileRow>;

  protected readonly clientePagoSeleccionado = signal<ClienteRespuestaDto | null>(null);

  protected readonly importarDialogVisible = signal(false);
  protected readonly importando = signal(false);
  protected readonly erroresImportacion = signal<ImportacionSociosResponseDto | null>(null);

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

    this.mobileList.connect(
      (params) => this.clientesService.getAll(params),
      mapClienteCardMobileRow,
    );
  }

  protected readonly columns = this.columnsService.columns;

  protected readonly loadDataFn: LoadDataFn<ClienteListadoRow> = (params) =>
    this.clientesService.getAll(params).pipe(
      map((page) => ({
        ...page,
        content: page.content.map(mapClienteListadoRow),
      })),
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

  protected onImportarExcelClick(): void {
    this.importarDialogVisible.set(true);
  }

  protected onDescargarPlantillaImportacion(): void {
    this.clientesService
      .descargarPlantillaImportacionSocios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => this.errorHandler.handle(error),
      });
  }

  protected onCancelarImportar(): void {
    this.importarDialogVisible.set(false);
  }

  protected onConfirmarImportar(file: File): void {
    this.importando.set(true);

    this.clientesService
      .importarSocios(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.importando.set(false);
          this.importarDialogVisible.set(false);

          if (response.filasConError > 0) {
            this.erroresImportacion.set(response);
            return;
          }

          this.confirmDialogService
            .open({
              title: 'Importación exitosa',
              message: `Se importaron ${response.filasImportadas} de ${response.totalFilas} socios correctamente.`,
              confirmButtonLabel: 'Aceptar',
              showCancelButton: false,
              variant: 'success',
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.recargarTabla());
        },
        error: (error) => {
          this.importando.set(false);
          this.errorHandler.handle(error);
        },
      });
  }

  protected onAceptarErroresImportacion(): void {
    this.erroresImportacion.set(null);
    this.recargarTabla();
  }

  protected onReintentarImportar(): void {
    this.erroresImportacion.set(null);
    this.recargarTabla();
    this.importarDialogVisible.set(true);
  }

  private recargarTabla(): void {
    this.tableState.updateFilters({
      ...this.tableState.queryParams().filters,
    });
  }
}
