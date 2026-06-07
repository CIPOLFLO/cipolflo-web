import { ChangeDetectionStrategy, Component, computed, Signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AppButton,
  FormActions,
  FormLayout,
  FormSection,
  PageLayout,
  type FormFieldConfig,
} from '../../../shared';
import { MetodoCobro, EstadoSocio, METODO_COBRO_OPTIONS } from '../models/cliente.model';
import { ClienteFormBase } from '../cliente-form-base';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-nuevo-cliente',
  imports: [ReactiveFormsModule, PageLayout, FormLayout, FormSection, FormActions, AppButton],
  templateUrl: './nuevo-cliente.html',
  styleUrl: './nuevo-cliente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevoCliente extends ClienteFormBase {
  protected override readonly confirmSiempreVerificaValido = true;
  protected override readonly backLink = computed<string>(() => '/clientes');

  constructor() {
    super(
      new FormGroup({
        cedula: new FormControl<string | null>(null, Validators.required),
        nombre: new FormControl<string | null>(null, Validators.required),
        telefono: new FormControl<string | null>(null, Validators.required),
        email: new FormControl<string | null>(null, Validators.email),
        pais: new FormControl<string | null>('Uruguay', Validators.required),
        departamento: new FormControl<string | null>(null, Validators.required),
        ciudad: new FormControl<string | null>(null, Validators.required),
        direccion: new FormControl<string | null>(null),
        observaciones: new FormControl<string | null>(null),
        fechaNacimiento: new FormControl<string | null>(null, Validators.required),
        estado: new FormControl<string | null>(EstadoSocio.Activo),
        metodoCobro: new FormControl<MetodoCobro | null>(
          MetodoCobro.Cobradora,
          Validators.required,
        ),
      }),
    );
    this.form
      .get('fechaNacimiento')
      ?.addValidators(this.validaciones.mayorDeEdad.bind(this.validaciones));
    this.form.get('fechaNacimiento')?.updateValueAndValidity({ emitEvent: false });
  }

  protected override readonly infoFields = computed<FormFieldConfig[]>(() => [
    { key: 'nombre', label: 'Nombre', type: 'text', required: true },
    { key: 'cedula', label: 'Cédula', type: 'text', required: true },
    { key: 'telefono', label: 'Teléfono', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date', required: true },
    {
      key: 'metodoCobro',
      label: 'Método de cobro',
      type: 'select',
      required: true,
      defaultValue: MetodoCobro.Cobradora,
      options: METODO_COBRO_OPTIONS,
    },
  ]);

  protected readonly ubicacionFields: Signal<FormFieldConfig[]> = computed(() => [
    { key: 'pais', label: 'País', type: 'text', required: true, defaultValue: 'Uruguay' },
    { key: 'departamento', label: 'Departamento', type: 'text', required: true },
    { key: 'ciudad', label: 'Ciudad', type: 'text', required: true },
    { key: 'direccion', label: 'Dirección', type: 'text' },
  ]);

  protected override readonly adicionalFields = computed<FormFieldConfig[]>(() => [
    { key: 'observaciones', label: 'Notas / Observaciones', type: 'textarea' },
  ]);

  protected override onConfirmar(): void {
    super.onConfirmar();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    this.loading.set(true);

    this.clientesService
      .registrarSocio({
        cedula: v['cedula']!.trim(),
        nombre: v['nombre']!.trim(),
        fechaNacimiento: v['fechaNacimiento']!,
        telefono: v['telefono']!.trim(),
        email: v['email']?.trim() || null,
        metodoCobro: v['metodoCobro']!,
        pais: v['pais']!.trim(),
        departamento: v['departamento']!.trim(),
        ciudad: v['ciudad']!.trim(),
        direccion: v['direccion']?.trim() || '',
        observaciones: v['observaciones']?.trim() || null,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (cliente) => {
          this.router.navigate(['/clientes', cliente.id]);
        },
        error: (err: unknown) => {
          this.errorHandler.handle(err);
        },
      });
  }
}
