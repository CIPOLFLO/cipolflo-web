import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, filter, map, switchMap } from 'rxjs';
import {
  AppButton,
  DetailRegistroSection,
  DetailSection,
  FormActions,
  FormLayout,
  PageLayout,
  type DetailFieldConfig,
  type DetailRegistroData,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzaService } from '../services/finanza.service';
import { TipoMovimiento } from '../models/finanza.model';

@Component({
  standalone: true,
  selector: 'app-detalle-finanza',
  imports: [
    CommonModule,
    PageLayout,
    FormLayout,
    AppButton,
    FormActions,
    DetailSection,
    DetailRegistroSection,
  ],
  templateUrl: './detalle-finanza.html',
  styleUrl: './detalle-finanza.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleFinanza {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly finanzaService = inject(FinanzaService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly tipoMovimiento = TipoMovimiento;
  protected readonly finanzaId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: '',
  });

  protected readonly finanza = toSignal(
    toObservable(this.finanzaId).pipe(
      filter((id) => /^\d+$/.test(id)),
      switchMap((id) =>
        this.finanzaService.getById(Number(id)).pipe(
          catchError((err) => {
            this.errorHandler.handle(err);
            this.router.navigate(['/finanzas']);
            return EMPTY;
          }),
        ),
      ),
    ),
    { initialValue: undefined },
  );

  protected readonly infoFields = computed<DetailFieldConfig[]>(() => {
    const f = this.finanza();
    if (!f) return [];

    return [
      { key: 'procedencia', label: 'Procedencia', value: f.procedencia },
      { key: 'cocepto', label: 'Concepto', value: f.concepto },
      { key: 'fecha', label: 'Fecha', value: f.fecha },
      {
        key: 'importe',
        label: 'Importe',
        value: this.formatImporte(f.importe, f.tipoMovimiento),
        valueClass: this.tipoMovimientoConfig[f.tipoMovimiento].valueClass,
      },
      { key: 'formaPago', label: 'Forma de Pago', value: f.formaPago },
      {
        key: 'notas',
        label: 'Notas/Observaciones',
        value: f.notas ?? null,
        fullWidth: true,
        multiline: true,
      },
    ];
  });

  protected readonly registroData = computed<DetailRegistroData | null>(() => {
    const f = this.finanza();
    if (!f) return null;

    return {
      entityId: f.codigo,
      entityIdLabel: 'ID del Movimiento',
      fechaRegistro: f.createdAt,
      registradoPor: f.createdBy,
    };
  });
  protected readonly registroExtraFields = computed<DetailFieldConfig[]>(() => {
    const f = this.finanza();
    if (!f) return [];

    return [
      {
        key: 'tipoMovimiento',
        label: 'Tipo de Movimiento',
        value: this.tipoMovimientoConfig[f.tipoMovimiento].label,
      },
    ];
  });

  protected onEditar(): void {
    // TODO: navegar a /finanzas/:id/editar cuando se implemente la pantalla de edición
    this.router.navigate(['/finanzas', this.finanzaId()]);
  }

  protected formatImporte(importe: number, tipoMovimiento: TipoMovimiento): string {
    const { signo } = this.tipoMovimientoConfig[tipoMovimiento];
    return `${signo} $ ${importe.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private readonly tipoMovimientoConfig: Record<
    TipoMovimiento,
    { label: string; signo: string; valueClass: string }
  > = {
    [TipoMovimiento.Ingreso]: { label: 'Ingreso', signo: '+', valueClass: 'success' },
    [TipoMovimiento.Egreso]: { label: 'Egreso', signo: '-', valueClass: 'danger' },
  };
}
