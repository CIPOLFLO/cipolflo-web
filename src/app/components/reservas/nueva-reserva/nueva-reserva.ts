import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { filter, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AppButton,
  ConfirmDialogComponent,
  ConfirmDialogService,
  emailValido,
  ErrorDialogComponent,
  ErrorDialogService,
  FormActions,
  FormField,
  FormLayout,
  FormSection,
  OccupancyCalendar,
  PageLayout,
  parseNumberOrNull,
  Procedencia,
  PROCEDENCIA_OPTIONS,
  type DateRangeSelection,
  type FormFieldConfig,
  type FormFieldOption,
} from '../../../shared';
import {
  EstadoSocio,
  TipoCliente,
  TIPO_CLIENTE_FORM_OPTIONS,
} from '../../clientes/models/cliente.model';
import { ReservaFormBase } from '../reserva-form-base';
import {
  estadoInicialPorTipo,
  TIPO_RESERVA_OPTIONS,
  TipoReserva,
  type ReservaCreacionRequestDto,
} from '../models/reserva.model';
import { ReservasService } from '../services/reservas.service';

@Component({
  standalone: true,
  selector: 'app-nueva-reserva',
  imports: [
    PageLayout,
    FormLayout,
    FormSection,
    FormField,
    FormActions,
    AppButton,
    OccupancyCalendar,
    ConfirmDialogComponent,
    ErrorDialogComponent,
  ],
  providers: [ReservasService],
  templateUrl: './nueva-reserva.html',
  styleUrl: './nueva-reserva.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaReserva extends ReservaFormBase {
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly errorDialog = inject(ErrorDialogService);
  private readonly reservasService = inject(ReservasService);

  constructor() {
    super(
      new FormGroup({
        tipoReserva: new FormControl<string | null>(TipoReserva.Comun),
        procedencia: new FormControl<string | null>(null, Validators.required),
        servicioId: new FormControl<string | null>(null, Validators.required),
        fechaInicio: new FormControl<string | null>(null, Validators.required),
        fechaFin: new FormControl<string | null>(null, Validators.required),
        cantidadTotal: new FormControl<string | null>(null),
        cantidadMenores: new FormControl<string | null>(null, Validators.min(0)),
        cantidad: new FormControl<string | null>(null),
        tipoCliente: new FormControl<string | null>(null),
        cedula: new FormControl<string | null>(null),
        nombre: new FormControl<string | null>(null),
        celular: new FormControl<string | null>(null),
        email: new FormControl<string | null>(null),
        numeroSocio: new FormControl<string | null>(null),
        rut: new FormControl<string | null>(null),
        nombreColaboracion: new FormControl<string | null>(null),
        notas: new FormControl<string | null>(null),
      }),
    );

    this.form.get('email')?.addValidators(emailValido);
    this.form.get('email')?.updateValueAndValidity({ emitEvent: false });

    // Punto de entrada desde el listado de clientes: precarga del cliente (readonly).
    const clienteId = this.route.snapshot.queryParamMap.get('clienteId');
    if (clienteId) {
      this.clientePrellenado.set(true);
      this.obtenerClientePorId(Number(clienteId))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cliente) => this.aplicarCliente(cliente));
    }
  }

  // --- Configuración de campos de la sección "Información de la Reserva" ---

  protected readonly tipoReservaField: FormFieldConfig = {
    key: 'tipoReserva',
    label: 'Tipo de reserva',
    type: 'select',
    required: true,
    options: TIPO_RESERVA_OPTIONS,
    defaultValue: TipoReserva.Comun,
  };

  protected readonly procedenciaField: FormFieldConfig = {
    key: 'procedencia',
    label: 'Procedencia',
    type: 'select',
    required: true,
    placeholder: 'Seleccione una procedencia',
    options: PROCEDENCIA_OPTIONS,
  };

  protected readonly servicioOptions = computed<FormFieldOption[]>(() =>
    this.servicios().map((s) => ({ label: s.nombre, value: String(s.id) })),
  );

  protected readonly servicioField = computed<FormFieldConfig>(() => ({
    key: 'servicioId',
    label: 'Servicio',
    type: 'select',
    required: true,
    disabled: this.servicios().length === 0,
    placeholder:
      this.servicios().length === 0 ? 'Elija primero una procedencia' : 'Seleccione un servicio',
    options: this.servicioOptions(),
  }));

  protected readonly cantidadTotalField: FormFieldConfig = {
    key: 'cantidadTotal',
    label: 'Cantidad total',
    type: 'number',
    required: true,
  };

  protected readonly cantidadMenoresField: FormFieldConfig = {
    key: 'cantidadMenores',
    label: 'Cantidad de menores',
    type: 'number',
  };

  protected readonly cantidadField: FormFieldConfig = {
    key: 'cantidad',
    label: 'Cantidad',
    type: 'number',
    required: true,
  };

  // --- Sección de cliente (tipo Común) ---

  protected readonly tipoClienteField: FormFieldConfig = {
    key: 'tipoCliente',
    label: 'Tipo de cliente',
    type: 'select',
    required: true,
    placeholder: 'Seleccione',
    options: TIPO_CLIENTE_FORM_OPTIONS,
  };

  protected readonly cedulaField = computed<FormFieldConfig>(() => ({
    key: 'cedula',
    label: 'Cédula',
    type: 'text',
    required: true,
    disabled: this.clientePrellenado(),
  }));

  protected readonly nombreField = computed<FormFieldConfig>(() => ({
    key: 'nombre',
    label: 'Nombre',
    type: 'text',
    required: true,
    disabled: this.clienteCamposDeshabilitados(),
  }));
  protected readonly celularField = computed<FormFieldConfig>(() => ({
    key: 'celular',
    label: 'Celular',
    type: 'text',
    required: true,
    disabled: this.clienteCamposDeshabilitados(),
  }));

  protected readonly emailField = computed<FormFieldConfig>(() => ({
    key: 'email',
    label: 'Email',
    type: 'text',
    disabled: this.clienteCamposDeshabilitados(),
  }));

  protected readonly numeroSocioField: FormFieldConfig = {
    key: 'numeroSocio',
    label: 'Nº de socio',
    type: 'text',
  };

  protected readonly observacionesField: FormFieldConfig = {
    key: 'observaciones',
    label: 'Observaciones sobre el cliente',
    type: 'textarea',
    fullWidth: true,
  };

  // --- Sección de cliente (tipo Colaboración sin fines de lucro) ---

  protected readonly rutField: FormFieldConfig = {
    key: 'rut',
    label: 'RUT del cliente',
    type: 'text',
  };

  protected readonly nombreColaboracionField: FormFieldConfig = {
    key: 'nombreColaboracion',
    label: 'Nombre del cliente',
    type: 'text',
    required: true,
  };

  protected readonly notasField: FormFieldConfig = {
    key: 'notas',
    label: 'Notas / Observaciones',
    type: 'textarea',
    fullWidth: true,
  };

  protected readonly lupitaVisible = computed(
    () => !this.clientePrellenado() && !this.esColaboracion(),
  );

  protected controlValue(key: string): string | null {
    return (this.form.get(key)?.value as string | null) ?? null;
  }

  protected onRangoSeleccionado(rango: DateRangeSelection): void {
    this.onControlChange('fechaInicio', rango.inicio);
    this.onControlChange('fechaFin', rango.fin);
  }

  override onConfirmar(): void {
    super.onConfirmar();
    if (this.form.invalid) return;

    const cliente = this.clienteBusqueda();
    if (!this.esColaboracion() && this.esSocio() && cliente) {
      this.verificarSocioYGuardar(cliente.id);
      return;
    }
    this.guardar();
  }

  private verificarSocioYGuardar(clienteId: number): void {
    this.loading.set(true);
    this.clientesService
      .getEstadoSocio(clienteId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (estado) => {
          if (estado.estado === EstadoSocio.Baja) {
            this.errorDialog.open({
              title: 'Socio dado de baja',
              message:
                'El socio está dado de baja. No es posible registrar una reserva a su nombre.',
            });
            return;
          }
          if (estado.estado === EstadoSocio.Inactivo) {
            this.confirmDialog
              .open({
                title: 'Socio inactivo',
                message:
                  'El socio figura como inactivo. ¿Desea continuar y registrar la reserva igualmente?',
                confirmButtonLabel: 'Continuar',
                cancelButtonLabel: 'Cancelar',
                variant: 'warning',
              })
              .pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef))
              .subscribe(() => this.guardar());
            return;
          }
          this.guardar();
        },
        error: (err: unknown) => this.errorHandler.handle(err),
      });
  }

  private guardar(): void {
    const dto = this.construirDto();
    this.loading.set(true);
    this.reservasService
      .crear(dto)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => this.router.navigate(['/reservas']),
        error: (err: unknown) => this.errorHandler.handle(err),
      });
  }

  private construirDto(): ReservaCreacionRequestDto {
    const colaboracion = this.esColaboracion();
    const tipoReserva = (this.controlValue('tipoReserva') as TipoReserva) ?? TipoReserva.Comun;
    const cliente = this.clienteBusqueda();

    return {
      tipoReserva,
      procedencia: this.controlValue('procedencia') as Procedencia,
      servicioId: Number(this.controlValue('servicioId')),
      fechaInicio: this.controlValue('fechaInicio')!,
      fechaFin: this.controlValue('fechaFin')!,
      cantidadTotal: this.modoCapacidad()
        ? parseNumberOrNull(this.controlValue('cantidadTotal'))
        : null,
      cantidadMenores: parseNumberOrNull(this.controlValue('cantidadMenores')),
      cantidad: this.modoCantidad() ? parseNumberOrNull(this.controlValue('cantidad')) : null,
      estado: estadoInicialPorTipo(tipoReserva),
      pago: false,
      clienteId: cliente?.id ?? null,
      tipoCliente: colaboracion ? null : (this.controlValue('tipoCliente') as TipoCliente | null),
      cedula: colaboracion ? null : this.controlValue('cedula'),
      nombre: colaboracion ? this.controlValue('nombreColaboracion') : this.controlValue('nombre'),
      celular: colaboracion ? null : this.controlValue('celular'),
      email: colaboracion ? null : this.controlValue('email'),
      rut: colaboracion ? this.controlValue('rut') : null,
      notas: this.controlValue('notas'),
    };
  }
}
