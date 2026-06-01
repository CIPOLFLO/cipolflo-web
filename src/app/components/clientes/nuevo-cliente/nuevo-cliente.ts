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
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import {
  AppButton,
  FormActions,
  FormLayout,
  FormSection,
  PageLayout,
  type DetailRegistroData,
  type FormFieldConfig,
} from '../../../shared';
import { ClientesService } from '../services/cliente.service';
import {
  patchClienteForm,
  applySectionChange,
} from '../helpers/cliente-form.helper';
import {
  ClienteDetalleRespuestaDto,
  TipoCliente,
  MetodoCobro,
  METODO_COBRO_OPTIONS,
  ESTADO_SOCIO_OPTIONS,
} from '../models/cliente.model';
import { ClienteValidacionesService } from '../services/cliente-validaciones.service';

@Component({
  standalone: true,
  selector: 'app-modificar-cliente',
  imports: [ReactiveFormsModule, PageLayout, FormLayout, FormSection, FormActions, AppButton],
  templateUrl: './nuevo-cliente.html',
  styleUrl: './nuevo-cliente.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevoCliente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientesService = inject(ClientesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly validaciones = inject(ClienteValidacionesService);

  readonly id = input<string>('');

  protected readonly cliente = signal<ClienteDetalleRespuestaDto | null>(null);
  protected readonly clienteTipo = computed(() => this.cliente()?.tipoCliente);
  protected readonly esSocio = computed(() => this.clienteTipo() === TipoCliente.Socio);

  protected readonly form = new FormGroup({
    numeroSocio: new FormControl<string | null>({ value: null, disabled: true }),
    cedula: new FormControl<string | null>(null),
    nombre: new FormControl<string | null>(null, Validators.required),
    telefono: new FormControl<string | null>(null, Validators.required),
    email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    pais: new FormControl<string | null>(null, Validators.required),
    departamento: new FormControl<string | null>(null),
    ciudad: new FormControl<string | null>(null),
    direccion: new FormControl<string | null>(null),
    observaciones: new FormControl<string | null>(null),
    fechaNacimiento: new FormControl<string | null>(null),
    estado: new FormControl<string | null>(null),
    metodoCobro: new FormControl<MetodoCobro | null>(null),
  });

  private readonly formEvents = toSignal(this.form.events);

  protected readonly backLink = computed<string>(() => {
    const from = this.route.snapshot.queryParamMap.get('from');
    return from === 'listado' ? '/clientes' : `/clientes/${this.id()}`;
  });

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly confirmDisabled = computed(() => {
    this.formEvents();
    return (this.form.dirty && this.form.invalid) || this.loading();
  });

  constructor() {
  effect(() => {
    const c = this.cliente();

    if (!c) return;

    patchClienteForm(this.form, c);
  });
}

  ngOnInit(): void {
    const id = Number(this.id());

    if (Number.isNaN(id) || id <= 0) {
      this.router.navigate(['/clientes']);
      return;
    }
    this.clientesService
      .getById(id)
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
      {
        key: 'nombre',
        label: 'Nombre',
        type: 'text',
        defaultValue: c.nombre ?? undefined,
        required: true,
      },
      { key: 'cedula', label: 'Cédula', type: 'text', defaultValue: c.cedula ?? undefined },
      {
        key: 'telefono',
        label: 'Teléfono',
        type: 'text',
        defaultValue: c.telefono ?? undefined,
        required: true,
      },
      {
        key: 'email',
        label: 'Email',
        type: 'text',
        defaultValue: c.email ?? undefined,
        required: true,
      },
    ];

    if (this.esSocio()) {
      campos.push(
        {
          key: 'fechaNacimiento',
          label: 'Fecha de nacimiento',
          type: 'text',
          defaultValue: c.fechaNacimiento ?? undefined,
        },
        {
          key: 'numeroSocio',
          label: 'Nro de socio',
          type: 'text',
          defaultValue: c.numeroSocio ? String(c.numeroSocio) : undefined,
          disabled: true,
          locked: true,
        },
        {
          key: 'estado',
          label: 'Estado',
          type: 'select',
          defaultValue: c.estado ?? undefined,
          options: ESTADO_SOCIO_OPTIONS,
        },
        {
          key: 'metodoCobro',
          label: 'Método de cobro',
          type: 'select',
          defaultValue: c.metodoCobro ?? undefined,
          options: METODO_COBRO_OPTIONS,
        },
      );
    }

    return campos;
  });

  protected readonly ubicacionFields = computed<FormFieldConfig[]>(() => {
    const c = this.cliente();
    if (!c) return [];
    return [
      {
        key: 'pais',
        label: 'País',
        type: 'text',
        defaultValue: c.pais ?? undefined,
        required: true,
      },
      {
        key: 'departamento',
        label: 'Departamento',
        type: 'text',
        defaultValue: c.departamento ?? undefined,
      },
      { key: 'ciudad', label: 'Ciudad', type: 'text', defaultValue: c.ciudad ?? undefined },
      {
        key: 'direccion',
        label: 'Dirección',
        type: 'text',
        defaultValue: c.direccion ?? undefined,
      },
    ];
  });

  protected readonly adicionalFields = computed<FormFieldConfig[]>(() => {
    const c = this.cliente();
    if (!c) return [];
    return [
      {
        key: 'observaciones',
        label: 'Notas / Observaciones',
        type: 'textarea',
        defaultValue: c.observaciones ?? undefined,
      },
    ];
  });

  protected readonly infoErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    return this.validaciones.getClienteErrors(this.form, this.submitted());
  });

  protected readonly ubicacionErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    return this.validaciones.getUbicacionErrors(this.form, this.submitted());
  });

  protected readonly adicionalErrors = computed<Record<string, string>>(() => ({}));

  protected readonly registroData = computed<DetailRegistroData | null>(() => {
    const c = this.cliente();
    if (!c) return null;
    return {
      entityId: `CLI-${String(c.id).padStart(3, '0')}`,
      entityIdLabel: 'ID del Cliente',
      fechaRegistro: c.createdAt,
      registradoPor: c.createdBy,
    };
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

  protected onCancelar(): void {
    this.router.navigateByUrl(this.backLink());
  }
  protected onFieldBlur(key: string): void {
    this.form.get(key)?.markAsTouched();
  }
  protected onConfirmar(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

  

}
}
