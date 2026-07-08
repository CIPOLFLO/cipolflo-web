import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, filter, switchMap, Subscription } from 'rxjs';
import {
  AppButton,
  AppTable,
  FilterConfigProvider,
  FilterPanel,
  LoadDataFn,
  PageLayout,
  RowAction,
  TableStateService,
  TableExportService,
  ConfirmDialogService,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzasColumnsService } from '../services/finanzas-columns.service';
import { FinanzasFilterService } from '../services/finanzas-filter.service';
import { FinanzaService } from '../services/finanza.service';
import { FinanzaRow, TipoMovimiento } from '../models/finanza.model';
import { Router } from '@angular/router';
import { mapFacturaToFinanza } from '../mappers/factura-finanza.mapper';
import { DocumentIntelligenceService } from '../../documentos/services/document-intelligence.service';
import { LoadingDialog } from '../../../shared';
import { EliminarReservaCerradaDialog } from '../eliminar-reserva-cerrada-dialog/eliminar-reserva-cerrada-dialog';
import { ErrorResponse } from '../../../core/models/error-response.model';
import { resolveErrorMessage } from '../../../core/config/error-codes';

@Component({
  selector: 'app-listado-finanzas',
  imports: [
    PageLayout,
    FilterPanel,
    AppTable,
    AppButton,
    LoadingDialog,
    EliminarReservaCerradaDialog,
  ],
  providers: [
    TableStateService,
    TableExportService,
    FinanzasColumnsService,
    { provide: FilterConfigProvider, useClass: FinanzasFilterService },
  ],
  templateUrl: './listado-finanzas.html',
  styleUrls: ['./listado-finanzas.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoFinanzas {
  private readonly finanzaService = inject(FinanzaService);
  private readonly columnsService = inject(FinanzasColumnsService);
  private readonly filterConfigProvider = inject(FilterConfigProvider);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly router = inject(Router);
  protected readonly tableState = inject(TableStateService);
  protected readonly tableExport = inject(TableExportService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly documentoAzureService = inject(DocumentIntelligenceService);
  private facturaSubscription?: Subscription;

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
  protected readonly analizandoFactura = signal(false);
  protected readonly columns = this.columnsService.columns;

  protected readonly reservaCerradaAdvertencia = signal<{
    finanza: FinanzaRow;
    message: string;
  } | null>(null);
  protected readonly advertenciaProcesando = signal(false);

  protected readonly loadDataFn: LoadDataFn<FinanzaRow> = (params) =>
    this.finanzaService.getAll(params).pipe(
      map((response) => ({
        ...response,
        content: response.content.map((dto) => ({
          id: dto.id,
          concepto: dto.concepto,
          fecha: dto.fecha,
          importeSignado: dto.tipoMovimiento === TipoMovimiento.Egreso ? -dto.importe : dto.importe,
          descripcion: dto.descripcion,
        })),
      })),
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

  protected readonly rowActions = (row: FinanzaRow): RowAction<FinanzaRow>[] => [
    {
      label: 'Ver detalle',
      icon: 'pi pi-eye',
      command: () => this.router.navigate(['/finanzas', row.id]),
    },
    {
      label: 'Modificar',
      icon: 'pi pi-pencil',
      command: () => this.router.navigate(['/finanzas', row.id, 'editar']),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      command: () => this.onEliminarFinanza(row),
    },
  ];

  protected onNuevoMovimiento(): void {
    this.router.navigate(['/finanzas', 'nuevo']);
  }

  protected onFilterChange(filters: Record<string, string>): void {
    this.tableState.updateFilters(filters);
  }

  protected onEliminarFinanza(finanza: FinanzaRow): void {
    this.confirmDialogService
      .open({
        title: 'Eliminar movimiento',
        message: '¿Confirma que quiere eliminar este movimiento financiero?',
        confirmButtonLabel: 'Eliminar',
        cancelButtonLabel: 'Cancelar',
        variant: 'danger',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.finanzaService.eliminar(finanza.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.recargarTabla(),
        error: (err) => {
          if (this.esConfirmacionRequerida(err)) {
            this.mostrarAdvertenciaReservaCerrada(finanza, err);
          } else {
            this.errorHandler.handle(err);
          }
        },
      });
  }

  private esConfirmacionRequerida(err: unknown): err is HttpErrorResponse {
    return (
      err instanceof HttpErrorResponse &&
      (err.error as Partial<ErrorResponse>)?.codigo === 'CONFIRMACION_ELIMINACION_REQUERIDA'
    );
  }

  private mostrarAdvertenciaReservaCerrada(finanza: FinanzaRow, err: HttpErrorResponse): void {
    this.reservaCerradaAdvertencia.set({ finanza, message: resolveErrorMessage(err) });
  }

  protected onEliminarDeTodasFormas(): void {
    const advertencia = this.reservaCerradaAdvertencia();
    if (!advertencia || this.advertenciaProcesando()) return;

    this.advertenciaProcesando.set(true);
    this.finanzaService
      .eliminar(advertencia.finanza.id, true)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cerrarAdvertencia();
          this.recargarTabla();
        },
        error: (err) => {
          this.cerrarAdvertencia();
          this.errorHandler.handle(err);
        },
      });
  }

  protected onRegistrarEgresoAsociado(): void {
    if (this.advertenciaProcesando()) return;
    this.cerrarAdvertencia();
    this.router.navigate(['/finanzas', 'nuevo']);
  }

  protected onCancelarAdvertencia(): void {
    if (this.advertenciaProcesando()) return;
    this.cerrarAdvertencia();
  }

  private cerrarAdvertencia(): void {
    this.reservaCerradaAdvertencia.set(null);
    this.advertenciaProcesando.set(false);
  }

  private recargarTabla(): void {
    this.tableState.updateFilters({ ...this.tableState.queryParams().filters });
  }

  protected onDescargarListado(): void {
    const filters = this.tableState.queryParams().filters;
    this.tableExport.exportar(() => this.finanzaService.exportar(filters));
  }

  protected onCargarFacturaClick(input: HTMLInputElement): void {
    input.click();
  }
  protected onFacturaSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const tiposPermitidos = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/bmp',
      'image/tiff',
      'image/heif',
    ];

    if (!tiposPermitidos.includes(file.type)) {
      this.errorHandler.handle(
        new Error('Formato no permitido. Usá PDF, JPG, PNG, BMP, TIFF o HEIF.'),
      );
      return;
    }

    const maxSizeBytes = 4 * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      this.errorHandler.handle(new Error('El archivo supera el límite de 4 MB.'));
      return;
    }

    this.analizandoFactura.set(true);

    this.facturaSubscription = this.documentoAzureService
      .analizarFactura(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (documento) => {
          this.analizandoFactura.set(false);
          this.facturaSubscription = undefined;

          try {
            const datosPrecargados = mapFacturaToFinanza(documento);
            this.router.navigate(['/finanzas', 'nuevo'], {
              state: { facturaAnalizada: datosPrecargados },
            });
          } catch (err) {
            this.errorHandler.handle(err);
          }
        },
        error: (err) => {
          this.analizandoFactura.set(false);
          this.facturaSubscription = undefined;
          this.errorHandler.handle(err);
        },
      });

    input.value = '';
  }

  protected onCancelarAnalisisFactura(): void {
    this.facturaSubscription?.unsubscribe();
    this.facturaSubscription = undefined;
    this.analizandoFactura.set(false);
  }
}
