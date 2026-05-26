import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ClientesService } from '../services/cliente.service';
import { ClienteOptionsService } from '../services/cliente-options.service';
import { ClienteValidacionesService } from '../services/cliente-validaciones.service';
import { ClienteCrearDto, MetodoPago, TipoCliente } from '../models/cliente.model';
import {
  AppButton,
  FormActions,
  FormLayout,
  FormSection,
  PageLayout,
  type FormFieldConfig,
} from '../../../shared';

@Component({
  selector: 'app-nuevo-cliente',
  standalone: true,
  imports: [ReactiveFormsModule, PageLayout, FormLayout, FormSection, FormActions, AppButton],
  templateUrl: './nuevo-cliente.html',
  styleUrl: './nuevo-cliente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevoCliente {
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClientesService);
  private readonly optionsService = inject(ClienteOptionsService);
  private readonly validaciones = inject(ClienteValidacionesService);

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);

  protected readonly form = new FormGroup({
    tipoCliente: new FormControl<TipoCliente>(TipoCliente.Socio, {
      nonNullable: true,
    }),
    nombre: new FormControl<string | null>(null, Validators.required),
    cedula: new FormControl<string | null>(null, [
      Validators.required,
      (control) => this.validaciones.cedulaValida(control),
    ]),
    fechaNacimiento: new FormControl<string | null>(null, [
      Validators.required,
      (control) => this.validaciones.mayorDeEdad(control),
    ]),
    telefono: new FormControl<string | null>(null, Validators.required),
    email: new FormControl<string | null>(null, [
      (control) => this.validaciones.emailValido(control),
    ]),
    metodoPago: new FormControl<MetodoPago | null>(MetodoPago.Cobradora, Validators.required),
    pais: new FormControl<string | null>('Uruguay', Validators.required),
    departamento: new FormControl<string | null>(null, Validators.required),
    ciudad: new FormControl<string | null>(null, Validators.required),
    direccion: new FormControl<string | null>(null),
    observaciones: new FormControl<string | null>(null),
  });

  protected readonly confirmDisabled = computed(() => this.form.invalid || this.loading());

  protected readonly clienteFields = computed<FormFieldConfig[]>(() => [
    {
      key: 'tipoCliente',
      label: 'Tipo de cliente',
      type: 'text',
      value: 'Socio',
      disabled: true,
    },
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'text',
      required: true,
      placeholder: 'Ingrese el nombre completo',
    },
    {
      key: 'cedula',
      label: 'Cédula',
      type: 'text',
      required: true,
      placeholder: 'Ej: 5.123.456-7',
    },
    {
      key: 'fechaNacimiento',
      label: 'Fecha de nacimiento',
      type: 'date',
      required: true,
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      type: 'text',
      required: true,
      placeholder: '099123456',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'correo@ejemplo.com',
    },
    {
      key: 'metodoPago',
      label: 'Método de pago',
      type: 'select',
      required: true,
      options: this.metodosPago(),
    },
  ]);

  protected readonly ubicacionFields = computed<FormFieldConfig[]>(() => [
    {
      key: 'pais',
      label: 'País',
      type: 'text',
      required: true,
    },
    {
      key: 'departamento',
      label: 'Departamento',
      type: 'text',
      required: true,
      placeholder: 'Seleccionar un departamento',
    },
    {
      key: 'ciudad',
      label: 'Ciudad',
      type: 'text',
      required: true,
      placeholder: 'Seleccionar una ciudad',
    },
    {
      key: 'direccion',
      label: 'Dirección',
      type: 'text',
      placeholder: 'Ingrese la dirección',
    },
  ]);

  protected readonly adicionalFields = computed<FormFieldConfig[]>(() => [
    {
      key: 'observaciones',
      label: 'Notas / Observaciones',
      type: 'textarea',
      placeholder: 'Ingrese cualquier observación o nota adicional sobre el cliente...',
    },
  ]);
  private addRequiredError(
    errors: Record<string, string>,
    key: string,
    message: string,
  ): void {
    const control = this.form.get(key);

    if (this.submitted() && control?.hasError('required')) {
      errors[key] = message;
    }
  }

  protected readonly clienteErrors = computed<Record<string, string>>(() => {
    const errors: Record<string, string> = {};
    const cedula = this.form.get('cedula')!;
    const fechaNacimiento = this.form.get('fechaNacimiento')!;
    const email = this.form.get('email')!;

    this.addRequiredError(errors, 'nombre', 'El nombre es obligatorio.');
    this.addRequiredError(errors, 'cedula', 'La cédula es obligatoria.');
    this.addRequiredError(errors, 'fechaNacimiento', 'La fecha de nacimiento es obligatoria.');
    this.addRequiredError(errors, 'telefono', 'El teléfono es obligatorio.');

    if (this.submitted() && cedula.hasError('cedulaInvalida')) {
      errors['cedula'] = 'La cédula no es válida.';
    }

    if (this.submitted() && fechaNacimiento.hasError('menorDeEdad')) {
      errors['fechaNacimiento'] = 'El cliente debe ser mayor de 18 años.';
    }

    if (this.submitted() && email.hasError('emailInvalido')) {
      errors['email'] = 'El email no es válido.';
    }

    return errors;
  });

  protected readonly ubicacionErrors = computed<Record<string, string>>(() => {
    const errors: Record<string, string> = {};

    if (this.submitted() && this.form.get('pais')?.hasError('required')) {
      errors['pais'] = 'El país es obligatorio.';
    }

    if (this.submitted() && this.form.get('departamento')?.hasError('required')) {
      errors['departamento'] = 'El departamento es obligatorio.';
    }

    if (this.submitted() && this.form.get('ciudad')?.hasError('required')) {
      errors['ciudad'] = 'La ciudad es obligatoria.';
    }

    return errors;
  });

  protected readonly metodosPago = toSignal(this.optionsService.getMetodosPago(), {
    initialValue: [],
  });
  protected readonly adicionalErrors = computed<Record<string, string>>(() => ({}));

  protected onClienteChange(
    values: Partial<{
      tipoCliente: TipoCliente;
      nombre: string | null;
      cedula: string | null;
      fechaNacimiento: string | null;
      telefono: string | null;
      email: string | null;
      metodoPago: MetodoPago | null;
    }>,
  ): void {
    this.form.patchValue({
      nombre: values['nombre'] ?? null,
      cedula: values['cedula'] ?? null,
      fechaNacimiento: values['fechaNacimiento'] ?? null,
      telefono: values['telefono'] ?? null,
      email: values['email'] ?? null,
      metodoPago: values['metodoPago'] ?? null,
    });
  }

  protected onUbicacionChange(values: Record<string, string | null>): void {
    this.form.patchValue({
      pais: values['pais'] ?? null,
      departamento: values['departamento'] ?? null,
      ciudad: values['ciudad'] ?? null,
      direccion: values['direccion'] ?? null,
    });
  }

  protected onAdicionalChange(values: Record<string, string | null>): void {
    this.form.patchValue({
      observaciones: values['observaciones'] ?? null,
    });
  }

  protected onCancelar(): void {
    this.router.navigate(['/clientes']);
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.loading.set(true);
    const {
      nombre,
      cedula,
      fechaNacimiento,
      telefono,
      email,
      metodoPago,
      pais,
      departamento,
      ciudad,
      direccion,
      observaciones,
    } = this.form.getRawValue();

    const dto: ClienteCrearDto = {
      tipoCliente: TipoCliente.Socio,
      nombre: nombre!.trim(),
      cedula: cedula!.trim(),
      fechaNacimiento: fechaNacimiento!,
      telefono: telefono!.trim(),
      email: email?.trim() ?? null,
      metodoPago: metodoPago!,
      pais: pais!.trim(),
      departamento: departamento!.trim(),
      ciudad: ciudad!.trim(),
      direccion: direccion?.trim() ?? null,
      observaciones: observaciones?.trim() ?? null,
    };

    this.clienteService.create(dto).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/clientes']);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error al crear el cliente', err);
      },
    });
  }
}
