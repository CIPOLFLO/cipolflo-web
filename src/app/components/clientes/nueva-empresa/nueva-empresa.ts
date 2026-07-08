import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  AppButton,
  FormActions,
  FormLayout,
  FormSection,
  PageLayout,
  applySectionChange,
  markFieldAsTouched,
  type FormFieldConfig,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ClientesService } from '../services/cliente.service';
import { ClienteValidacionesService } from '../services/cliente-validaciones.service';
import { buildUbicacionFields, submitRegistroCliente } from '../helpers/cliente-form.helper';

@Component({
  standalone: true,
  selector: 'app-nueva-empresa',
  imports: [ReactiveFormsModule, PageLayout, FormLayout, FormSection, FormActions, AppButton],
  templateUrl: './nueva-empresa.html',
  styleUrl: './nueva-empresa.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaEmpresa {
  private readonly router = inject(Router);
  private readonly clientesService = inject(ClientesService);
  private readonly validaciones = inject(ClienteValidacionesService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly backLink = '/clientes';

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  private readonly blurCount = signal(0);

  protected readonly form = new FormGroup({
    razonSocial: new FormControl<string | null>(null, Validators.required),
    rut: new FormControl<string | null>(null, Validators.required),
    telefono: new FormControl<string | null>(null, Validators.required),
    mail: new FormControl<string | null>(null, Validators.email),
    pais: new FormControl<string | null>('Uruguay', Validators.required),
    departamento: new FormControl<string | null>(null, Validators.required),
    ciudad: new FormControl<string | null>(null, Validators.required),
    direccion: new FormControl<string | null>(null, Validators.required),
    observaciones: new FormControl<string | null>(null),
  });

  private readonly formEvents = toSignal(this.form.events);

  constructor() {
    this.form.get('rut')?.addValidators(this.validaciones.rutValida.bind(this.validaciones));
    this.form.get('rut')?.updateValueAndValidity({ emitEvent: false });
  }

  protected readonly confirmDisabled = computed(() => {
    this.formEvents();
    return this.form.invalid || this.loading();
  });

  protected readonly infoFields = computed<FormFieldConfig[]>(() => [
    { key: 'razonSocial', label: 'Razón social', type: 'text', required: true },
    { key: 'rut', label: 'RUT', type: 'text', required: true },
    { key: 'telefono', label: 'Teléfono', type: 'text', required: true },
    { key: 'mail', label: 'Email', type: 'text' },
  ]);

  protected readonly ubicacionFields = computed<FormFieldConfig[]>(() =>
    buildUbicacionFields(true),
  );

  protected readonly adicionalFields = computed<FormFieldConfig[]>(() => [
    { key: 'observaciones', label: 'Notas / Observaciones', type: 'textarea' },
  ]);

  protected readonly infoErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.blurCount();
    return this.validaciones.getEmpresaErrors(this.form, this.submitted());
  });

  protected readonly ubicacionErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.blurCount();
    return this.validaciones.getUbicacionErrors(this.form, this.submitted());
  });

  protected onInfoChange(values: Record<string, string | null>): void {
    applySectionChange(this.form, values);
  }

  protected onUbicacionChange(values: Record<string, string | null>): void {
    applySectionChange(this.form, values);
  }

  protected onAdicionalChange(values: Record<string, string | null>): void {
    applySectionChange(this.form, values);
  }

  protected onFieldBlur(key: string): void {
    markFieldAsTouched(this.form, key);
    this.blurCount.update((v) => v + 1);
  }

  protected onCancelar(): void {
    this.router.navigateByUrl(this.backLink);
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    submitRegistroCliente(
      this.clientesService.registrarEmpresa({
        razonSocial: v.razonSocial!.trim(),
        rut: v.rut!.trim(),
        pais: v.pais!.trim(),
        departamento: v.departamento!.trim(),
        ciudad: v.ciudad!.trim(),
        direccion: v.direccion!.trim(),
        telefono: v.telefono!.trim(),
        mail: v.mail?.trim() || null,
        observaciones: v.observaciones?.trim() || null,
      }),
      {
        loading: this.loading,
        destroyRef: this.destroyRef,
        errorHandler: this.errorHandler,
        onSuccess: () => {
          this.router.navigate(['/clientes']);
        },
      },
    );
  }
}
