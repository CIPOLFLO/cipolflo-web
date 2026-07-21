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
import { AntiguedadReservasService } from '../services/antiguedad-reservas.service';
import { AntiguedadReservasResponseDto } from '../models/ajuste.model';

function aniosValido(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string | null;
  if (value === null || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? null : { aniosInvalido: true };
}

@Component({
  standalone: true,
  selector: 'app-antiguedad-reservas-card',
  imports: [ReactiveFormsModule, FormSection, AppButton],
  templateUrl: './antiguedad-reservas-card.html',
  styleUrl: './antiguedad-reservas-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AntiguedadReservasCard implements OnInit {
  private readonly service = inject(AntiguedadReservasService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly form = new FormGroup({
    anios: new FormControl<string | null>(null, [Validators.required, aniosValido]),
  });

  private readonly formStatus = toSignal(this.form.statusChanges, {
    initialValue: this.form.status,
  });
  private readonly tick = signal(0);

  protected readonly submitted = signal(false);
  protected readonly guardando = signal(false);
  protected readonly guardadoOk = signal(false);
  private readonly antiguedad = signal<AntiguedadReservasResponseDto | null>(null);

  protected readonly fields = computed<FormFieldConfig[]>(() => [
    {
      key: 'anios',
      label: 'Antigüedad de reservas (años)',
      type: 'number',
      required: true,
      defaultValue: this.antiguedad() ? String(this.antiguedad()!.anios) : undefined,
    },
  ]);

  protected readonly errors = computed<Record<string, string>>(() => {
    this.formStatus();
    this.tick();
    const errors: Record<string, string> = {};
    const control = this.form.get('anios');
    if (!(this.submitted() || control?.touched)) return errors;
    if (control?.hasError('required')) {
      errors['anios'] = 'La antigüedad es obligatoria.';
    } else if (control?.hasError('aniosInvalido')) {
      errors['anios'] = 'La antigüedad debe ser un número entero mayor a 0.';
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
        this.antiguedad.set(dto);
        this.form.patchValue({ anios: String(dto.anios) });
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

    const anios = Number(this.form.getRawValue().anios);
    this.guardando.set(true);
    this.service.actualizar({ anios }).subscribe({
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
