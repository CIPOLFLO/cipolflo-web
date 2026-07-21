import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  applySectionChange,
  AppButton,
  FormFieldConfig,
  FormSection,
  markFieldAsTouched,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { CostoCuotaService } from '../services/costo-cuota.service';
import { CostoCuotaResponseDto } from '../models/ajuste.model';

function montoValido(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;
  if (value === null || value === '') return null;
  const n = Number(value);
  return !Number.isNaN(n) && n > 0 ? null : { montoInvalido: true };
}

@Component({
  standalone: true,
  selector: 'app-costo-cuota-card',
  imports: [ReactiveFormsModule, FormSection, AppButton],
  templateUrl: './costo-cuota-card.html',
  styleUrl: './costo-cuota-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CostoCuotaCard implements OnInit {
  private readonly service = inject(CostoCuotaService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly form = new FormGroup({
    monto: new FormControl<string | null>(null, [Validators.required, montoValido]),
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });
  private readonly tick = signal(0);

  protected readonly submitted = signal(false);
  protected readonly guardando = signal(false);
  protected readonly guardadoOk = signal(false);
  private readonly costoCuota = signal<CostoCuotaResponseDto | null>(null);

  protected readonly fields = computed<FormFieldConfig[]>(() => [
    {
      key: 'monto',
      label: 'Costo de cuota social',
      type: 'currency',
      required: true,
      defaultValue: this.costoCuota() ? String(this.costoCuota()!.monto) : undefined,
    },
  ]);

  protected readonly errors = computed<Record<string, string>>(() => {
    this.formStatus();
    this.tick();
    const errors: Record<string, string> = {};
    const control = this.form.get('monto');
    if (!(this.submitted() || control?.touched)) return errors;
    if (control?.hasError('required')) {
      errors['monto'] = 'El costo de cuota es obligatorio.';
    } else if (control?.hasError('montoInvalido')) {
      errors['monto'] = 'El costo debe ser mayor a 0.';
    }
    return errors;
  });

  protected readonly guardarDisabled = computed(() => {
    this.formStatus();
    return this.form.invalid || this.guardando();
  });

  ngOnInit(): void {
    this.service.obtener().subscribe({
      next: (dto) => {
        this.costoCuota.set(dto);
        this.form.patchValue({ monto: String(dto.monto) });
      },
      error: (err) => this.errorHandler.handle(err),
    });
  }

  protected onValuesChange(values: Record<string, string | null>): void {
    applySectionChange(this.form, values);
    this.tick.update((v) => v + 1);
    this.guardadoOk.set(false);
  }

  protected onBlur(key: string): void {
    markFieldAsTouched(this.form, key);
    this.tick.update((v) => v + 1);
  }

  protected onGuardar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const monto = Number(this.form.getRawValue().monto);
    this.guardando.set(true);
    this.service.actualizar({ monto }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.guardadoOk.set(true);
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorHandler.handle(err);
      },
    });
  }
}
