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
import {
  MetodoCobro,
  EstadoSocio,
  METODO_COBRO_OPTIONS,
  CategoriaSocio,
  CATEGORIA_SOCIO_OPTIONS,
} from '../models/cliente.model';
import { ClienteFormBase } from '../cliente-form-base';
import { buildUbicacionFields, submitRegistroCliente } from '../helpers/cliente-form.helper';

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
        categoriaSocio: new FormControl<CategoriaSocio | null>(
          CategoriaSocio.SocioComun,
          Validators.required,
        ),
        fechaIngreso: new FormControl<string | null>(
          new Date().toISOString().split('T')[0],
          Validators.required,
        ),
      }),
    );
    this.form
      .get('fechaNacimiento')
      ?.addValidators(this.validaciones.mayorDeEdad.bind(this.validaciones));
    this.form.get('fechaNacimiento')?.updateValueAndValidity({ emitEvent: false });
    this.form
      .get('fechaIngreso')
      ?.addValidators(this.validaciones.fechaIngresoValida.bind(this.validaciones));

    this.form.get('fechaIngreso')?.updateValueAndValidity({ emitEvent: false });
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
    {
      key: 'categoriaSocio',
      label: 'Categoría',
      type: 'select',
      required: true,
      defaultValue: CategoriaSocio.SocioComun,
      options: CATEGORIA_SOCIO_OPTIONS,
    },
    {
      key: 'fechaIngreso',
      label: 'Fecha de ingreso',
      type: 'date',
      required: true,
      defaultValue: new Date().toISOString().split('T')[0],
    },
  ]);

  protected readonly ubicacionFields: Signal<FormFieldConfig[]> = computed(() =>
    buildUbicacionFields(),
  );

  protected override readonly adicionalFields = computed<FormFieldConfig[]>(() => [
    { key: 'observaciones', label: 'Notas / Observaciones', type: 'textarea' },
  ]);

  protected override onConfirmar(): void {
    super.onConfirmar();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    submitRegistroCliente(
      this.clientesService.registrarSocio({
        cedula: v['cedula']!.trim(),
        nombreCompleto: v['nombre']!.trim(),
        fechaNacimiento: v['fechaNacimiento']!,
        telefono: v['telefono']!.trim(),
        email: v['email']?.trim() || null,
        metodoCobro: v['metodoCobro']!,
        pais: v['pais']!.trim(),
        departamento: v['departamento']!.trim(),
        ciudad: v['ciudad']!.trim(),
        direccion: v['direccion']?.trim() || null,
        observaciones: v['observaciones']?.trim() || null,
        categoriaSocio: v['categoriaSocio']!,
        fechaIngreso: v['fechaIngreso']!,
      }),
      {
        loading: this.loading,
        destroyRef: this.destroyRef,
        errorHandler: this.errorHandler,
        onSuccess: (cliente) => {
          this.router.navigate(['/clientes', cliente.id]);
        },
      },
    );
  }
}
