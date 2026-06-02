import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  OnInit,
  Signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AppButton,
  DetailRegistroSection,
  FormActions,
  FormLayout,
  FormSection,
  PageLayout,
  type FormFieldConfig,
} from '../../../shared';
import {
  EstadoSocio,
  MetodoCobro,
  METODO_COBRO_OPTIONS,
  TipoCliente,
} from '../models/cliente.model';
import { ClienteFormBase } from '../cliente-form-base';

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
export class ModificarCliente extends ClienteFormBase implements OnInit {
  constructor() {
    super(
      new FormGroup({
        numeroSocio: new FormControl<string | null>({ value: null, disabled: true }),
        cedula: new FormControl<string | null>(null, Validators.required),
        nombre: new FormControl<string | null>(null, Validators.required),
        telefono: new FormControl<string | null>(null, Validators.required),
        email: new FormControl<string | null>(null, Validators.email),
        departamento: new FormControl<string | null>(null),
        direccion: new FormControl<string | null>(null),
        pais: new FormControl<string | null>(null),
        ciudad: new FormControl<string | null>(null),
        observaciones: new FormControl<string | null>(null),
        fechaNacimiento: new FormControl<string | null>(null),
        estado: new FormControl<string | null>(null),
        metodoCobro: new FormControl<MetodoCobro | null>(null),
      }),
    );

    const mayorDeEdad = this.validaciones.mayorDeEdad.bind(this.validaciones);

    effect(() => {
      if (!this.clienteTipo()) return;
      if (this.esSocio()) {
        this.form.get('fechaNacimiento')?.addValidators([Validators.required, mayorDeEdad]);
        this.form.get('metodoCobro')?.addValidators(Validators.required);
        this.form.get('pais')?.addValidators(Validators.required);
        this.form.get('departamento')?.addValidators(Validators.required);
        this.form.get('ciudad')?.addValidators(Validators.required);
        this.form.get('fechaNacimiento')?.updateValueAndValidity({ emitEvent: false });
        this.form.get('metodoCobro')?.updateValueAndValidity({ emitEvent: false });
        this.form.get('pais')?.updateValueAndValidity({ emitEvent: false });
        this.form.get('departamento')?.updateValueAndValidity({ emitEvent: false });
        this.form.get('ciudad')?.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.cargarCliente();
  }

  protected override readonly infoFields = computed<FormFieldConfig[]>(() => {
    const c = this.cliente();
    if (!c) return [];

    const camposBase: FormFieldConfig[] = [
      {
        key: 'nombre',
        label: 'Nombre',
        type: 'text',
        defaultValue: c.nombre ?? undefined,
        required: true,
      },
      {
        key: 'cedula',
        label: 'Cédula',
        type: 'text',
        defaultValue: c.cedula ?? undefined,
        required: true,
      },
      {
        key: 'telefono',
        label: 'Teléfono',
        type: 'text',
        defaultValue: c.telefono ?? undefined,
        required: true,
      },
      { key: 'email', label: 'Email', type: 'text', defaultValue: c.email ?? undefined },
    ];

    const tipoClienteField: FormFieldConfig = {
      key: 'tipoCliente',
      label: 'Tipo de cliente',
      type: 'text',
      defaultValue: c.tipoCliente === TipoCliente.Socio ? 'Socio' : 'Particular',
      disabled: true,
      locked: true,
    };

    if (!this.esSocio()) return [tipoClienteField, ...camposBase];

    return [
      {
        key: 'numeroSocio',
        label: 'Nro de socio',
        type: 'text',
        defaultValue: c.numeroSocio ? String(c.numeroSocio) : undefined,
        disabled: true,
        locked: true,
      },
      tipoClienteField,
      ...camposBase,
      {
        key: 'fechaNacimiento',
        label: 'Fecha de nacimiento',
        type: 'date',
        defaultValue: c.fechaNacimiento ?? undefined,
        required: true,
      },
      {
        key: 'metodoCobro',
        label: 'Método de cobro',
        type: 'select',
        defaultValue: c.metodoCobro ?? undefined,
        required: true,
        options: [{ label: '', value: '' }, ...METODO_COBRO_OPTIONS],
      },
      {
        key: 'estado',
        label: 'Estado',
        type: 'select',
        defaultValue: c.estado ?? undefined,
        options: [
          { label: '', value: '' },
          { label: 'Activo', value: EstadoSocio.Activo },
          { label: 'Inactivo', value: EstadoSocio.Inactivo },
          { label: 'De baja', value: EstadoSocio.Baja },
        ],
      },
    ];
  });

  protected readonly ubicacionFields: Signal<FormFieldConfig[]> = computed(() => {
    const c = this.cliente();
    if (!c) return [];
    const esSocio = this.esSocio();
    return [
      {
        key: 'pais',
        label: 'País',
        type: 'text',
        defaultValue: c.pais ?? undefined,
        required: esSocio,
      },
      {
        key: 'departamento',
        label: 'Departamento',
        type: 'text',
        defaultValue: c.departamento ?? undefined,
        required: esSocio,
      },
      {
        key: 'ciudad',
        label: 'Ciudad',
        type: 'text',
        defaultValue: c.ciudad ?? undefined,
        required: esSocio,
      },
      {
        key: 'direccion',
        label: 'Dirección',
        type: 'text',
        defaultValue: c.direccion ?? undefined,
      },
    ];
  });
}
