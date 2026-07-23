import { computed, Signal, signal, WritableSignal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { applySectionChange, FormFieldConfig, markFieldAsTouched } from '../../shared';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

/**
 * Estado y lógica reactiva compartida por las cards de Ajustes de un único valor numérico
 * (Costo de Cuota, Antigüedad de Reservas): cargar el valor vigente, validarlo y guardarlo,
 * sin afectar el guardado de las demás configuraciones.
 */
export interface AjusteValorCardOptions<TDto, TReq> {
  label: string;
  type: 'currency' | 'number';
  validator: (control: AbstractControl) => ValidationErrors | null;
  invalidErrorKey: string;
  requiredMessage: string;
  invalidMessage: string;
  extractValor: (dto: TDto) => number;
  buildRequest: (valor: number) => TReq;
  obtener: () => Observable<TDto>;
  actualizar: (dto: TReq) => Observable<TDto>;
  errorHandler: ErrorHandlerService;
}

export interface AjusteValorCardState {
  form: FormGroup<{ valor: FormControl<string | null> }>;
  fields: Signal<FormFieldConfig[]>;
  errors: Signal<Record<string, string>>;
  guardando: WritableSignal<boolean>;
  guardadoOk: WritableSignal<boolean>;
  guardarDisabled: Signal<boolean>;
  cargarValor: () => void;
  onValuesChange: (values: Record<string, string | null>) => void;
  onBlur: (key: string) => void;
  onGuardar: () => void;
}

export function createAjusteValorCardState<TDto, TReq>(
  options: AjusteValorCardOptions<TDto, TReq>,
): AjusteValorCardState {
  const form = new FormGroup({
    valor: new FormControl<string | null>(null, [Validators.required, options.validator]),
  });

  const formStatus = toSignal(form.statusChanges, { initialValue: form.status });
  const tick = signal(0);

  const submitted = signal(false);
  const guardando = signal(false);
  const guardadoOk = signal(false);
  const valorCargado = signal<TDto | null>(null);

  const fields = computed<FormFieldConfig[]>(() => {
    const dto = valorCargado();
    return [
      {
        key: 'valor',
        label: options.label,
        type: options.type,
        required: true,
        defaultValue: dto ? String(options.extractValor(dto)) : undefined,
      },
    ];
  });

  const errors = computed<Record<string, string>>(() => {
    formStatus();
    tick();
    const errs: Record<string, string> = {};
    const control = form.get('valor');
    if (!(submitted() || control?.touched)) return errs;
    if (control?.hasError('required')) {
      errs['valor'] = options.requiredMessage;
    } else if (control?.hasError(options.invalidErrorKey)) {
      errs['valor'] = options.invalidMessage;
    }
    return errs;
  });

  const guardarDisabled = computed(() => {
    formStatus();
    return form.invalid || guardando();
  });

  function cargarValor(): void {
    options.obtener().subscribe({
      next: (dto) => {
        valorCargado.set(dto);
        form.patchValue({ valor: String(options.extractValor(dto)) });
      },
      error: (err) => options.errorHandler.handle(err),
    });
  }

  function onValuesChange(values: Record<string, string | null>): void {
    applySectionChange(form, values);
    tick.update((v) => v + 1);
    guardadoOk.set(false);
  }

  function onBlur(key: string): void {
    markFieldAsTouched(form, key);
    tick.update((v) => v + 1);
  }

  function onGuardar(): void {
    submitted.set(true);
    if (form.invalid) return;

    const valor = Number(form.getRawValue().valor);
    guardando.set(true);
    options.actualizar(options.buildRequest(valor)).subscribe({
      next: () => {
        guardando.set(false);
        guardadoOk.set(true);
      },
      error: (err) => {
        guardando.set(false);
        options.errorHandler.handle(err);
      },
    });
  }

  return {
    form,
    fields,
    errors,
    guardando,
    guardadoOk,
    guardarDisabled,
    cargarValor,
    onValuesChange,
    onBlur,
    onGuardar,
  };
}
