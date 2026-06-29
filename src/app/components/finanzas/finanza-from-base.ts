import { computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Procedencia, PROCEDENCIA_OPTIONS, type FormFieldConfig } from '../../shared';
import { FinanzaValidacionesService } from './services/finanza-validaciones.service';
import {
  Concepto,
  FormaPago,
  FORMA_PAGO_OPTIONS,
  getConceptoOptionsByTipoMovimiento,
  TipoMovimiento,
  TIPO_MOVIMIENTO_FORM_OPTIONS,
} from './models/finanza.model';

export abstract class FinanzaFormBase {
  protected readonly validaciones = inject(FinanzaValidacionesService);

  protected readonly form = new FormGroup({
    tipoMovimiento: new FormControl<TipoMovimiento | null>(
      TipoMovimiento.Ingreso,
      Validators.required,
    ),
    procedencia: new FormControl<Procedencia | null>(Procedencia.Sede, Validators.required),
    concepto: new FormControl<Concepto | null>(Concepto.PagoReserva, Validators.required),
    fecha: new FormControl<string | null>(null, Validators.required),
    importe: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    formaPago: new FormControl<FormaPago | null>(FormaPago.Efectivo, Validators.required),
    notas: new FormControl<string | null>(null),
  });

  protected readonly formEvents = toSignal(this.form.events);
  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly touchCount = signal(0);
  protected readonly dataVersion = signal(0);

  protected readonly confirmDisabled = computed(() => {
    this.formEvents();
    return this.form.invalid || this.loading();
  });

  protected readonly movimientoFields = computed<FormFieldConfig[]>(() => {
    this.formEvents();
    this.dataVersion();

    return [
      {
        key: 'tipoMovimiento',
        label: 'Tipo de Movimiento',
        type: 'select',
        required: true,
        defaultValue: this.form.get('tipoMovimiento')?.value ?? undefined,
        disabled: this.tipoMovimientoDisabled,
        options: TIPO_MOVIMIENTO_FORM_OPTIONS,
      },
    ];
  });

  protected readonly infoFields = computed<FormFieldConfig[]>(() => {
    this.formEvents();
    this.dataVersion();

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
        options: getConceptoOptionsByTipoMovimiento(this.form.get('tipoMovimiento')?.value),
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

  protected readonly adicionalFields = computed<FormFieldConfig[]>(() => {
    this.formEvents();
    this.dataVersion();

    return [
      {
        key: 'notas',
        label: 'Notas / Observaciones',
        type: 'textarea',
        fullWidth: true,
        defaultValue: this.form.get('notas')?.value ?? undefined,
        placeholder: 'Ingrese cualquier observación o detalle sobre este movimiento...',
      },
    ];
  });

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
  protected readonly tipoMovimientoDisabled: boolean = false;

  protected inicializarValidaciones(): void {
    this.form.get('fecha')?.addValidators(this.validaciones.fechaNoFutura.bind(this.validaciones));
    this.form.get('fecha')?.updateValueAndValidity({ emitEvent: false });
  }

  protected onMovimientoChange(values: Record<string, string | null>): void {
    if (this.tipoMovimientoDisabled) return;

    const tipoMovimiento = (values['tipoMovimiento'] ?? null) as TipoMovimiento | null;
    const conceptoActual = this.form.get('concepto')?.value ?? null;

    const conceptosPermitidos = getConceptoOptionsByTipoMovimiento(tipoMovimiento).map(
      (option) => option.value,
    );

    const conceptoEsValido =
      conceptoActual !== null && conceptosPermitidos.includes(conceptoActual);

    this.form.patchValue({
      tipoMovimiento,
      concepto: conceptoEsValido ? conceptoActual : Concepto.Otro,
    });

    this.form.markAsDirty();
    this.dataVersion.update((n) => n + 1);
  }

  protected onInfoChange(values: Record<string, string | null>): void {
    this.form.patchValue({
      procedencia: (values['procedencia'] ?? null) as Procedencia | null,
      concepto: (values['concepto'] ?? null) as Concepto | null,
      fecha: values['fecha'] ?? null,
      importe: this.toNum(values['importe']),
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

  private toNum(value: string | null): number | null {
    if (!value) return null;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
}
