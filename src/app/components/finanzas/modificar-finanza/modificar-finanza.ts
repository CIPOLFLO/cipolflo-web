import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, filter, map, switchMap } from 'rxjs';
import {
  AppButton,
  FormActions,
  FormLayout,
  FormSection,
  PageLayout,
  Procedencia,
  PROCEDENCIA_OPTIONS,
  type FormFieldConfig,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { FinanzaService } from '../services/finanza.service';
import { FinanzaValidacionesService } from '../services/finanza-validaciones.service';
import {
  Concepto,
  CONCEPTO_OPTIONS,
  FinanzaModificarDto,
  FormaPago,
  FORMA_PAGO_OPTIONS,
  TipoMovimiento,
  TIPO_MOVIMIENTO_FORM_OPTIONS,
} from '../models/finanza.model';

@Component({
  standalone: true,
  selector: 'app-modificar-finanza',
  imports: [ReactiveFormsModule, PageLayout, FormLayout, FormSection, FormActions, AppButton],
  templateUrl: './modificar-finanza.html',
  styleUrl: './modificar-finanza.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificarFinanza {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly finanzaService = inject(FinanzaService);
  private readonly validaciones = inject(FinanzaValidacionesService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly finanzaId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: '',
  });

  protected readonly form = new FormGroup({
    tipoMovimiento: new FormControl<TipoMovimiento | null>(
      { value: TipoMovimiento.Ingreso, disabled: true },
      Validators.required,
    ),
    procedencia: new FormControl<Procedencia | null>(Procedencia.Sede, Validators.required),
    concepto: new FormControl<Concepto | null>(Concepto.PagoReserva, Validators.required),
    fecha: new FormControl<string | null>(null, Validators.required),
    importe: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    formaPago: new FormControl<FormaPago | null>(FormaPago.Efectivo, Validators.required),
    notas: new FormControl<string | null>(null),
  });

  constructor() {
    this.form.get('fecha')?.addValidators(this.validaciones.fechaNoFutura.bind(this.validaciones));
    this.form.get('fecha')?.updateValueAndValidity({ emitEvent: false });

    this.route.paramMap
      .pipe(
        map((p) => p.get('id') ?? ''),
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
      )
      .subscribe((finanza) => {
        this.form.patchValue({
          tipoMovimiento: finanza.tipoMovimiento,
          procedencia: finanza.procedencia,
          concepto: Concepto.PagoReserva,
          fecha: finanza.fecha,
          importe: finanza.importe,
          formaPago: finanza.formaPago as FormaPago,
          notas: finanza.notas ?? null,
        });
      });
  }

  private readonly formEvents = toSignal(this.form.events);

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  private readonly touchCount = signal(0);

  protected readonly confirmDisabled = computed(() => {
    this.formEvents();
    return this.form.invalid || !this.form.dirty || this.loading();
  });

  protected readonly movimientoFields = computed<FormFieldConfig[]>(() => [
    {
      key: 'tipoMovimiento',
      label: 'Tipo de Movimiento',
      type: 'select',
      required: true,
      disabled: true,
      defaultValue: this.form.get('tipoMovimiento')?.value ?? TipoMovimiento.Ingreso,
      options: TIPO_MOVIMIENTO_FORM_OPTIONS,
    },
  ]);

  protected readonly infoFields = computed<FormFieldConfig[]>(() => {
    return [
      {
        key: 'procedencia',
        label: 'Procedencia',
        type: 'select',
        required: true,
        defaultValue: this.form.get('procedencia')?.value ?? undefined,
        options: PROCEDENCIA_OPTIONS,
      },
      {
        key: 'concepto',
        label: 'Concepto',
        type: 'select',
        required: true,
        defaultValue: this.form.get('concepto')?.value ?? undefined,
        options: CONCEPTO_OPTIONS,
      },
      {
        key: 'fecha',
        label: 'Fecha',
        type: 'date',
        required: true,
        defaultValue: this.form.get('fecha')?.value ?? undefined,
      },
      {
        key: 'importe',
        label: 'Importe',
        type: 'currency',
        required: true,
        defaultValue: this.form.get('importe')?.value?.toString() ?? undefined,
      },
      {
        key: 'formaPago',
        label: 'Forma de Pago',
        type: 'select',
        required: true,
        defaultValue: this.form.get('formaPago')?.value ?? undefined,
        options: FORMA_PAGO_OPTIONS,
      },
    ];
  });

  protected readonly adicionalFields = computed<FormFieldConfig[]>(() => [
    {
      key: 'notas',
      label: 'Notas / Observaciones',
      type: 'textarea',
      fullWidth: true,
      defaultValue: this.form.get('notas')?.value ?? undefined,
      placeholder: 'Ingrese cualquier observación o detalle sobre este movimiento...',
    },
  ]);

  protected readonly movimientoErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.touchCount();
    return this.validaciones.getMovimientoErrors(this.form, this.submitted());
  });

  protected readonly infoErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.touchCount();
    return this.validaciones.getInfoErrors(this.form, this.submitted());
  });

  protected onInfoChange(values: Record<string, string | null>): void {
    const toNum = (v: string | null): number | null => {
      if (!v) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    };

    this.form.patchValue({
      procedencia: (values['procedencia'] ?? null) as Procedencia | null,
      concepto: (values['concepto'] ?? null) as Concepto | null,
      fecha: values['fecha'] ?? null,
      importe: toNum(values['importe']),
      formaPago: (values['formaPago'] ?? null) as FormaPago | null,
    });
    this.form.markAsDirty();
  }

  protected onAdicionalChange(values: Record<string, string | null>): void {
    this.form.patchValue({ notas: values['notas'] ?? null });
    this.form.markAsDirty();
  }

  protected onFieldBlur(key: string): void {
    this.form.get(key)?.markAsTouched();
    this.touchCount.update((n) => n + 1);
  }

  protected onCancelar(): void {
    this.router.navigate(['/finanzas']);
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const { procedencia, concepto, fecha, importe, formaPago, notas } = this.form.getRawValue();

    const dto: FinanzaModificarDto = {
      procedencia: procedencia!,
      concepto: concepto!,
      fecha: fecha!,
      importe: importe!,
      formaPago: formaPago!,
      notas,
    };

    this.loading.set(true);
    this.finanzaService.update(Number(this.finanzaId()), dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/finanzas']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorHandler.handle(err);
      },
    });
  }
}
