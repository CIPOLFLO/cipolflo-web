import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, map, of, filter, switchMap } from 'rxjs';
import {
  AppButton,
  AppTable,
  FilterConfigProvider,
  FilterPanel,
  LoadDataFn,
  PageLayout,
  RowAction,
  TableStateService,
  ConfirmDialogService,
  Procedencia,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzasColumnsService } from '../services/finanzas-columns.service';
import { FinanzasFilterService } from '../services/finanzas-filter.service';
import { FinanzaService } from '../services/finanza.service';
import { FinanzaRow, TipoMovimiento, FinanzaCrearDto, Concepto, FormaPago } from '../models/finanza.model';
import { Router } from '@angular/router';
import { DocumentIntelligenceService, DocumentoAnalizadoResponse } from '../../documentos/services/document-intelligence.service';

@Component({
  selector: 'app-listado-finanzas',
  imports: [PageLayout, FilterPanel, AppTable, AppButton],
  providers: [
    TableStateService,
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
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly documentoAzureService = inject(DocumentIntelligenceService);


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
  protected readonly exportando = signal(false);
  protected readonly columns = this.columnsService.columns;
  protected readonly puedeExportar = computed(
    () => this.tableState.hasResults() && !this.tableState.loading() && !this.exportando(),
  );

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
          this.errorHandler.handle(err);
        },
      });
  }

  private recargarTabla(): void {
    this.tableState.updateFilters({ ...this.tableState.queryParams().filters });
  }

  protected onDescargarListado(): void {
    if (!this.puedeExportar() || this.exportando()) return;

    this.exportando.set(true);

    const filters = this.tableState.queryParams().filters;
    console.log('Filtros exportación:', filters);

    this.finanzaService
      .exportar(filters)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.exportando.set(false);
        },
        error: (err) => {
          this.exportando.set(false);
          this.errorHandler.handle(err);
        },
      });
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
        new Error('Formato no permitido. Usá PDF, JPG, PNG, BMP, TIFF o HEIF.')
      );
      return;
    }

    const maxSizeBytes = 4 * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      this.errorHandler.handle(
        new Error('El archivo supera el límite de 4 MB.')
      );
      return;
    }

    this.analizandoFactura.set(true);

    this.documentoAzureService
      .analizarFactura(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (documento) => {
          this.analizandoFactura.set(false);

          const datosPrecargados = this.mapearDocumentoAFinanza(documento);

          this.router.navigate(['/finanzas', 'nuevo'], {
            state: {
              facturaAnalizada: datosPrecargados,
            },
          });
        },
        error: (err) => {
          this.analizandoFactura.set(false);
          this.errorHandler.handle(err);
        },
      });

    input.value = '';
  }

  private extraerImporteTotal(content: string): number | undefined {
    const match = content.match(/IMPORTE TOTAL\s*\$?([\d.]+,\d{2})/i);

    if (!match?.[1]) return undefined;

    return Number(match[1].replace(/\./g, '').replace(',', '.'));
  }

  private extraerNumeroFactura(content: string): string | null {
    const match = content.match(/Nº de Factura\s+.*?\n([A-Z]\s*\d+)/i);

    return match?.[1]?.replace(/\s+/g, ' ') ?? null;
  }

  private detectarConcepto(content: string): Concepto {
    const texto = content.toUpperCase();

    if (texto.includes('UTE')) return Concepto.Ute;
    if (texto.includes('ANTEL')) return Concepto.Antel;
    if (texto.includes('OSE')) return Concepto.Ose;
    if (texto.includes('BARRACA')) return Concepto.Barraca;

    return Concepto.Otro;
  }

  private extraerFechaEmision(content: string): string | null {
    const match = content.match(/Fecha de Emisión\s+(\d{2}\/\d{2}\/\d{4})/i);

    if (!match?.[1]) return null;

    const [dia, mes, anio] = match[1].split('/');
    return `${anio}-${mes}-${dia}`;
  }
  private mapearDocumentoAFinanza(documento: DocumentoAnalizadoResponse): Partial<FinanzaCrearDto> {
    const resultado = JSON.parse(documento.resultadoJson);
    const content: string = resultado.content ?? '';

    const importe = this.extraerImporteTotal(content);
    const numeroFactura = this.extraerNumeroFactura(content);
    const concepto = this.detectarConcepto(content);

    const fechaEmision = this.extraerFechaEmision(content);
    const fechaHoy = new Date().toISOString().slice(0, 10);

    const fecha =
      [Concepto.Ute, Concepto.Ose, Concepto.Antel].includes(concepto)
        ? fechaHoy
        : fechaEmision ?? fechaHoy;
    return {
      tipoMovimiento: TipoMovimiento.Egreso,
      procedencia: Procedencia.Ambos,
      concepto,
      fecha: fecha,
      importe,
      notas: `Factura cargada: ${documento.nombreArchivo}${numeroFactura ? ` - Nº ${numeroFactura}` : ''}`,
    };
  }


}
