import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, map } from 'rxjs';
import { PageLayout } from '../../../shared/layout/page-layout/page-layout';
import { AppButton } from '../../../shared/components/button/button';
import { FilterPanel } from '../../../shared/components/filter-panel/filter-panel';
import { AppTable } from '../../../shared/components/table/table';
import { TableStateService } from '../../../shared/components/table/table-state.service';
import { TableExportService } from '../../../shared/components/table/table-export.service';
import { FilterConfigProvider } from '../../../shared/services/filter-config.provider';
import { ReservasFilterService } from '../services/reservas-filter.service';
import { ReservasService } from '../services/reservas.service';
import { LoadDataFn, RowAction } from '../../../shared/components/table/table.models';
import { ReservasColumnsService } from '../services/reserva-columns.service';
import {
  EstadoReserva,
  ConfirmDialogService,
  VerificationDialog,
  MobFilterPanel,
  MobInfiniteScroll,
  MobileListLoader,
  MobListLayout,
  MobPageHeader,
  MobFab,
} from '../../../shared';
import { PagoReserva } from '../pago-reserva/pago-reserva';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { PagosAsociadosDialog } from '../cancelar-reserva/pagos-asociados-dialog/pagos-asociados-dialog';
import {
  ReservaCancelacionCheckResponseDto,
  ReservaCancelacionRequestDto,
  ReservaRow,
  TipoReserva,
  ReservaFinalizacionCheckResponseDto,
  ReservaFinalizacionRequestDto,
} from '../models/reserva.model';
import { CompletarPagoDialog } from '../finalizar-reserva/completar-pago-dialog/completar-pago-dialog';
import { mapReservaListadoRow, ReservaListadoRow } from '../mappers/reserva-listado.mapper';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { MobReservaCard } from '../mob-reserva-card/mob-reserva-card';
import {
  mapReservaCardMobileRow,
  ReservaCardMobileRow,
} from '../mappers/reserva-card-mobile.mapper';

@Component({
  selector: 'app-listado-reservas',
  standalone: true,
  imports: [
    PageLayout,
    AppButton,
    FilterPanel,
    AppTable,
    PagoReserva,
    VerificationDialog,
    PagosAsociadosDialog,
    CompletarPagoDialog,
    MobPageHeader,
    MobListLayout,
    MobFilterPanel,
    MobReservaCard,
    MobInfiniteScroll,
    MobFab,
  ],
  providers: [
    TableStateService,
    TableExportService,
    ReservasService,
    ReservasColumnsService,
    MobileListLoader,
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
  protected readonly tableExport = inject(TableExportService);
  private readonly columnsService = inject(ReservasColumnsService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly verificandoCancelacionVisible = signal(false);
  protected readonly reservaCancelacionSeleccionada = signal<ReservaRow | null>(null);
  protected readonly cancelacionCheck = signal<ReservaCancelacionCheckResponseDto | null>(null);

  protected readonly reservaPagoSeleccionada = signal<ReservaRow | null>(null);
  protected readonly columns = this.columnsService.columns;

  protected readonly procesando = signal(false);

  protected readonly verificandoFinalizacionVisible = signal(false);
  protected readonly reservaFinalizacionSeleccionada = signal<ReservaRow | null>(null);
  protected readonly finalizacionCheck = signal<ReservaFinalizacionCheckResponseDto | null>(null);

  protected readonly loadDataFn: LoadDataFn<ReservaListadoRow> = (params) =>
    this.reservasService.getAll(params).pipe(
      map((page) => ({
        ...page,
        content: page.content.map(mapReservaListadoRow),
      })),
    );

  protected readonly breakpoint = inject(BreakpointService);
  protected readonly sidebar = inject(SidebarService);

  protected readonly mobileList = inject(
    MobileListLoader,
  ) as MobileListLoader<ReservaCardMobileRow>;

  constructor() {
    this.mobileList.connect(
      (params) => this.reservasService.getAll(params),
      mapReservaCardMobileRow,
    );
  }

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
    ...(this.puedeCancelar(row)
      ? [
          {
            label: 'Cancelar',
            icon: 'pi pi-ban',
            command: () => this.iniciarCancelacion(row),
          } satisfies RowAction<ReservaRow>,
        ]
      : []),
    ...(this.puedeFinalizar(row)
      ? [
          {
            label: 'Finalizar',
            icon: 'pi pi-check-circle',
            command: () => this.iniciarFinalizacion(row),
          } satisfies RowAction<ReservaRow>,
        ]
      : []),
    ...(row.requiereDocumentacion && !row.tieneDocumentacion
      ? [
          {
            label: 'Confirmar documentación',
            icon: 'pi pi-file-check',
            command: () => this.onConfirmarDocumentacion(row),
          } satisfies RowAction<ReservaRow>,
        ]
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

  protected onNuevaReserva(): void {
    this.router.navigate(['/reservas/nueva']);
  }

  protected onExportar(): void {
    const filters = this.tableState.queryParams().filters;
    this.tableExport.exportar(() => this.reservasService.exportar(filters));
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

  private onConfirmarDocumentacion(row: ReservaRow): void {
    this.confirmDialogService
      .open({
        title: 'Confirmar documentación',
        message: `¿Confirma que la reserva N° ${row.id} cuenta con la documentación requerida?`,
      })
      .subscribe((confirmado) => {
        if (!confirmado) return;

        this.reservasService.confirmarDocumentacion(row.id).subscribe(() => {
          this.recargarTabla();
        });
      });
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

  protected onCerrarCancelacionConPagos(): void {
    this.limpiarCancelacion();
  }

  protected onConfirmarCancelacionConPagos(dto: ReservaCancelacionRequestDto): void {
    this.ejecutarCancelacion(dto);
  }

  private iniciarCancelacion(row: ReservaRow): void {
    this.reservaCancelacionSeleccionada.set(row);
    this.verificandoCancelacionVisible.set(true);

    this.reservasService.verificarCancelacion(row.id).subscribe({
      next: (response) => {
        this.verificandoCancelacionVisible.set(false);

        if (response.puedeCancelarseDirectamente) {
          this.confirmDialogService
            .open({
              title: 'Cancelar reserva',
              message: `La reserva #${row.id} no tiene pagos asociados. ¿Confirmás la cancelación?`,
              confirmButtonLabel: 'Cancelar reserva',
              cancelButtonLabel: 'Volver',
              variant: 'danger',
            })
            .subscribe((confirmed) => {
              if (confirmed) {
                this.ejecutarCancelacion({ generarDevolucion: false });
              } else {
                this.limpiarCancelacion();
              }
            });
        } else {
          this.cancelacionCheck.set(response);
        }
      },
      error: (err) => {
        this.verificandoCancelacionVisible.set(false);
        this.limpiarCancelacion();
        this.errorHandler.handle(err);
      },
    });
  }

  private ejecutarCancelacion(dto: ReservaCancelacionRequestDto): void {
    const reserva = this.reservaCancelacionSeleccionada();

    if (!reserva) return;

    this.procesando.set(true);

    this.reservasService
      .cancelar(reserva.id, dto)
      .pipe(finalize(() => this.procesando.set(false)))
      .subscribe({
        next: () => {
          this.limpiarCancelacion();
          this.recargarTabla();
        },
        error: (err) => {
          this.errorHandler.handle(err);
        },
      });
  }

  private limpiarCancelacion(): void {
    this.verificandoCancelacionVisible.set(false);
    this.reservaCancelacionSeleccionada.set(null);
    this.cancelacionCheck.set(null);
  }

  private puedeCancelar(row: ReservaRow): boolean {
    return (
      row.estadoReserva === EstadoReserva.Pendiente ||
      row.estadoReserva === EstadoReserva.Confirmada
    );
  }

  protected onCerrarFinalizacionConSaldo(): void {
    this.limpiarFinalizacion();
  }

  protected onConfirmarFinalizacionConSaldo(dto: ReservaFinalizacionRequestDto): void {
    this.ejecutarFinalizacion(dto);
  }

  private iniciarFinalizacion(row: ReservaRow): void {
    this.reservaFinalizacionSeleccionada.set(row);
    this.verificandoFinalizacionVisible.set(true);

    this.reservasService.verificarFinalizacion(row.id).subscribe({
      next: (response) => {
        this.verificandoFinalizacionVisible.set(false);

        if (response.puedeFinalizarSinPago) {
          this.confirmDialogService
            .open({
              title: 'Finalizar reserva',
              message: `La reserva #${row.id} no tiene saldo pendiente. ¿Confirmás la finalización?`,
              confirmButtonLabel: 'Finalizar reserva',
              cancelButtonLabel: 'Volver',
              variant: 'primary',
            })
            .subscribe((confirmed) => {
              if (confirmed) {
                this.ejecutarFinalizacion({});
              } else {
                this.limpiarFinalizacion();
              }
            });
        } else {
          this.finalizacionCheck.set(response);
        }
      },
      error: (err) => {
        this.verificandoFinalizacionVisible.set(false);
        this.limpiarFinalizacion();
        this.errorHandler.handle(err);
      },
    });
  }

  private ejecutarFinalizacion(dto: ReservaFinalizacionRequestDto): void {
    const reserva = this.reservaFinalizacionSeleccionada();

    if (!reserva) return;

    this.procesando.set(true);

    this.reservasService
      .finalizar(reserva.id, dto)
      .pipe(finalize(() => this.procesando.set(false)))
      .subscribe({
        next: () => {
          this.limpiarFinalizacion();
          this.recargarTabla();
        },
        error: (err) => {
          this.errorHandler.handle(err);
        },
      });
  }

  private limpiarFinalizacion(): void {
    this.verificandoFinalizacionVisible.set(false);
    this.reservaFinalizacionSeleccionada.set(null);
    this.finalizacionCheck.set(null);
  }

  private puedeFinalizar(row: ReservaRow): boolean {
    return row.estadoReserva === EstadoReserva.EnCurso;
  }
}
