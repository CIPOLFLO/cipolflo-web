import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import {
  AppButton,
  DetailRegistroSection,
  FormActions,
  FormLayout,
  FormSection,
  PageLayout,
  type DetailRegistroData,
  type FormFieldConfig,
} from '../../../shared';
import { ClientesService } from '../services/clientes.service';
import {
  ClienteDetalleRespuestaDto,
  TipoCliente,
} from '../models/cliente.model';

@Component({
  standalone: true,
  selector: 'app-modificar-cliente',
  imports: [
    ReactiveFormsModule,
    PageLayout,
    FormLayout,
    FormSection,
    FormActions,
    AppButton,
    DetailRegistroSection,
  ],
  templateUrl: './modificar-cliente.html',
  styleUrl: './modificar-cliente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModificarCliente implements OnInit {
  private readonly router = inject(Router);
  private readonly clientesService = inject(ClientesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = input<string>('');
  readonly from = input<string>('');

  protected readonly cliente = signal<ClienteDetalleRespuestaDto | null>(null);
  protected readonly clienteTipo = computed(() => this.cliente()?.tipoCliente);
  protected readonly esSocio = computed(() => this.clienteTipo() === TipoCliente.Socio);

  protected readonly form = new FormGroup({
    // No editable en ningún caso
    numeroSocio:     new FormControl<string | null>({ value: null, disabled: true }),
    cedula:          new FormControl<string | null>({ value: null, disabled: true }),
    // Comunes editables
    nombre:          new FormControl<string | null>(null, Validators.required),
    telefono:        new FormControl<string | null>(null, Validators.required),
    email:           new FormControl<string | null>(null, [Validators.required, Validators.email]),
    departamento:    new FormControl<string | null>(null),
    direccion:       new FormControl<string | null>(null),
    observaciones:   new FormControl<string | null>(null),
    // Solo Socio
    fechaNacimiento: new FormControl<string | null>({ value: null, disabled: true }),
    estado:          new FormControl<string | null>(null),
    metodoPago:      new FormControl<string | null>(null),
  });

  private readonly formEvents = toSignal(this.form.events);

  protected readonly backLink = computed<string>(() =>
    this.from() === 'listado' ? '/clientes' : `/clientes/${this.id()}`,
  );

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly confirmDisabled = computed(
    () => (this.form.dirty && this.form.invalid) || this.loading(),
  );

  constructor() {
    effect(() => {
      const c = this.cliente();
      if (!c) return;
      this.form.patchValue({
        numeroSocio:     c.numeroSocio ?? null,
        cedula:          c.cedula ?? null,
        nombre:          c.nombre ?? null,
        telefono:        c.telefono ?? null,
        email:           c.email ?? null,
        departamento:    c.departamento ?? null,
        direccion:       c.direccion ?? null,
        observaciones:   c.observaciones ?? null,
        fechaNacimiento: c.fechaNacimiento ?? null,
        estado:          c.estado ?? null,
        metodoPago:      c.metodoPago ?? null,
      });
    });
  }

  ngOnInit(): void {
    this.clientesService
      .getById(Number(this.id()))
      .pipe(
        catchError((err) => {
          console.error('Error al cargar el cliente', err);
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((c) => {
        if (c) this.cliente.set(c);
      });
  }

  protected readonly infoFields = computed<FormFieldConfig[]>(() => {
    const c = this.cliente();
    if (!c) return [];

    const campos: FormFieldConfig[] = [
      { key: 'nombre',   label: 'Nombre',   type: 'text', defaultValue: c.nombre,   required: true },
      { key: 'cedula',   label: 'Cédula',   type: 'text', defaultValue: c.cedula,   disabled: true },
      { key: 'telefono', label: 'Teléfono', type: 'text', defaultValue: c.telefono, required: true },
      { key: 'email',    label: 'Email',    type: 'text', defaultValue: c.email,    required: true },
    ];

    if (this.esSocio()) {
      campos.push(
        { key: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'text', defaultValue: c.fechaNacimiento, disabled: true },
        { key: 'numeroSocio',     label: 'Nro de socio',        type: 'text', defaultValue: c.numeroSocio,     disabled: true },
        { key: 'estado',          label: 'Estado',              type: 'text', defaultValue: c.estado },
        {
          key: 'metodoPago', label: 'Método de pago', type: 'select', defaultValue: c.metodoPago,
          options: [
            { label: 'Cobradora',     value: 'COBRADORA' },
            { label: 'Transferencia', value: 'TRANSFERENCIA' },
            { label: 'Efectivo',      value: 'EFECTIVO' },
          ],
        },
      );
    }

    return campos;
  });

  protected readonly ubicacionFields = computed<FormFieldConfig[]>(() => {
    const c = this.cliente();
    if (!c) return [];
    return [
      { key: 'departamento', label: 'Departamento', type: 'text', value: c.departamento },
      { key: 'direccion',    label: 'Dirección',    type: 'text', value: c.direccion    },
    ];
  });

  protected readonly adicionalFields = computed<FormFieldConfig[]>(() => {
    const c = this.cliente();
    if (!c) return [];
    return [
      { key: 'observaciones', label: 'Notas / Observaciones', type: 'textarea', value: c.observaciones },
    ];
  });

  protected readonly infoErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    const errors: Record<string, string> = {};
    const keys = ['nombre', 'telefono', 'email'];
    for (const key of keys) {
      const control = this.form.get(key);
      if (!control?.invalid || (!control.touched && !this.submitted())) continue;
      if (control.errors?.['required']) errors[key] = 'Este campo es obligatorio';
      if (control.errors?.['email'])    errors[key] = 'El email no es válido';
    }
    return errors;
  });

  protected readonly ubicacionErrors = computed<Record<string, string>>(() => ({}));
  protected readonly adicionalErrors = computed<Record<string, string>>(() => ({}));

  protected readonly registroData = computed<DetailRegistroData | null>(() => {
    const c = this.cliente();
    if (!c) return null;
    return {
      entityId:      `CLI-${String(c.id).padStart(3, '0')}`,
      entityIdLabel: 'ID del Cliente',
      fechaRegistro: c.createdAt,
      registradoPor: c.createdBy,
    };
  });

  protected onInfoChange(values: Record<string, string | null>): void {
    this.form.patchValue(values);
    this.form.markAsDirty();
    for (const key of Object.keys(values)) {
      this.form.get(key)?.markAsTouched();
    }
  }

  protected onUbicacionChange(values: Record<string, string | null>): void {
    this.form.patchValue(values);
    this.form.markAsDirty();
    for (const key of Object.keys(values)) {
      this.form.get(key)?.markAsTouched();
    }
  }

  protected onAdicionalChange(values: Record<string, string | null>): void {
    this.form.patchValue(values);
    this.form.markAsDirty();
    for (const key of Object.keys(values)) {
      this.form.get(key)?.markAsTouched();
    }
  }

  protected onCancelar(): void {
    this.router.navigateByUrl(this.backLink());
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    // TODO: reemplazar con this.clientesService.update() cuando el endpoint esté disponible
    console.log('Actualizar cliente:', this.form.getRawValue());
  }
}