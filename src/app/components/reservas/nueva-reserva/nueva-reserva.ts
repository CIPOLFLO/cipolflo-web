import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  catchError,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AppButton,
  ConfirmDialogService,
  CurrencyFormatPipe,
  emailValido,
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
import { ClientesService } from '../../clientes/services/cliente.service';
import { ClienteValidacionesService } from '../../clientes/services/cliente-validaciones.service';
import { ReservaFormBase } from '../reserva-form-base';
import {
  TIPO_RESERVA_OPTIONS,
  TipoReserva,
  type CostoReservaRequestDto,
  type ReservaCreacionRequestDto,
} from '../models/reserva.model';
import { ReservasService } from '../services/reservas.service';
import { ReservaClienteBusquedaService } from '../services/reserva-cliente-busqueda.service';

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
    CurrencyFormatPipe,
  ],
  providers: [ReservasService, ReservaClienteBusquedaService],
  templateUrl: './nueva-reserva.html',
  styleUrl: './nueva-reserva.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaReserva extends ReservaFormBase {
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly errorDialog = inject(ErrorDialogService);
  private readonly reservasService = inject(ReservasService);
  private readonly clienteBusquedaService = inject(ReservaClienteBusquedaService);
  private readonly clientesService = inject(ClientesService);
  private readonly clienteValidaciones = inject(ClienteValidacionesService);

  private readonly buscarClienteTrigger = new Subject<string>();

  /** Costo de la reserva devuelto por el backend (mock por ahora); null si aún no aplica. */
  protected readonly costo = signal<number | null>(null);
  protected readonly costoCargando = signal(false);

  constructor() {
    super(
      new FormGroup({
        tipoReserva: new FormControl<string | null>(TipoReserva.Comun),
        procedencia: new FormControl<string | null>(null, Validators.required),
        servicioId: new FormControl<string | null>(null, Validators.required),
        fechaInicio: new FormControl<string | null>(null, Validators.required),
        fechaFin: new FormControl<string | null>(null, Validators.required),
        horaInicio: new FormControl<string | null>(null),
        horaFin: new FormControl<string | null>(null),
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

    this.form
      .get('cedula')
      ?.addValidators(this.clienteValidaciones.cedulaValida.bind(this.clienteValidaciones));
    this.form.get('cedula')?.updateValueAndValidity({ emitEvent: false });

    // Punto de entrada desde el listado de clientes: precarga del cliente (readonly).
    const clienteId = this.route.snapshot.queryParamMap.get('clienteId');
    if (clienteId) {
      this.clientePrellenado.set(true);
      this.clienteBusquedaService
        .buscarPorId(Number(clienteId))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cliente) => this.aplicarCliente(cliente));
    }

    // Si el usuario edita la cédula después de verificar, se invalida la búsqueda para
    // evitar que queden datos de un cliente asociados a una cédula que ya no corresponde.
    this.form
      .get('cedula')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.busquedaRealizada()) this.resetearBusquedaCliente();
      });

    this.escucharCostoReserva();
    this.inicializarBusquedaCliente();
  }

  /**
   * Recalcula el costo cada vez que cambian el servicio, el rango de fechas o las
   * cantidades. El debounce evita una llamada por cada tecla en los inputs numéricos.
   */
  private escucharCostoReserva(): void {
    merge(
      this.form.get('servicioId')!.valueChanges,
      this.form.get('fechaInicio')!.valueChanges,
      this.form.get('fechaFin')!.valueChanges,
      this.form.get('cantidad')!.valueChanges,
      this.form.get('cantidadTotal')!.valueChanges,
      this.form.get('cantidadMenores')!.valueChanges,
    )
      .pipe(
        debounceTime(300),
        switchMap(() => this.calcularCosto()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((costo) => this.costo.set(costo));
  }

  /** Pide el costo al backend si hay servicio y rango completos; si no, lo limpia. */
  private calcularCosto(): Observable<number | null> {
    const servicioId = this.servicioIdValue();
    const fechaInicio = this.controlValue('fechaInicio');
    const fechaFin = this.controlValue('fechaFin');
    if (!servicioId || !fechaInicio || !fechaFin) return of(null);

    const request: CostoReservaRequestDto = {
      servicioId,
      fechaInicio,
      fechaFin,
      cantidadTotal: this.modoCapacidad()
        ? parseNumberOrNull(this.controlValue('cantidadTotal'))
        : null,
      cantidadMenores: this.modoCapacidad()
        ? parseNumberOrNull(this.controlValue('cantidadMenores'))
        : null,
      cantidad: this.modoCantidad() ? parseNumberOrNull(this.controlValue('cantidad')) : null,
    };

    this.costoCargando.set(true);
    return this.reservasService.calcularCosto(request).pipe(
      map((respuesta) => respuesta.costo),
      catchError((err: unknown) => {
        this.errorHandler.handle(err);
        return of(null);
      }),
      finalize(() => this.costoCargando.set(false)),
    );
  }

  private inicializarBusquedaCliente(): void {
    this.buscarClienteTrigger
      .pipe(
        switchMap((cedula) =>
          this.clienteBusquedaService.buscarPorCedula(cedula).pipe(
            finalize(() => this.loading.set(false)),
            catchError((err: unknown) => {
              this.errorHandler.handle(err);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((cliente) => {
        this.busquedaRealizada.set(true);
        if (cliente) {
          this.aplicarCliente(cliente);
        } else {
          this.clienteBusqueda.set(null);
          this.habilitarCamposManuales();
        }
      });
  }

  protected buscarCliente(): void {
    const cedulaControl = this.form.get('cedula');
    const cedula = (cedulaControl?.value as string | null)?.trim();
    cedulaControl?.markAsTouched();
    if (!cedula || cedulaControl?.invalid) return;
    this.loading.set(true);
    this.buscarClienteTrigger.next(cedula);
  }

  private resetearBusquedaCliente(): void {
    this.busquedaRealizada.set(false);
    this.clienteBusqueda.set(null);
    this.form.patchValue({
      tipoCliente: null,
      nombre: null,
      celular: null,
      email: null,
      numeroSocio: null,
    });
  }

  private habilitarCamposManuales(): void {
    this.form.patchValue({
      tipoCliente: TipoCliente.Particular,
      nombre: null,
      celular: null,
      email: null,
      numeroSocio: null,
    });
  }

  // --- Configuración de campos de la sección "Información de la Reserva" ---

  protected readonly tipoReservaField = computed<FormFieldConfig>(() => ({
    key: 'tipoReserva',
    label: 'Tipo de reserva',
    type: 'select',
    required: true,
    // Colaboración no aplica cuando se entra desde un cliente concreto (precarga).
    options: this.clientePrellenado()
      ? TIPO_RESERVA_OPTIONS.filter((o) => o.value !== TipoReserva.ColaboracionSinFines)
      : TIPO_RESERVA_OPTIONS,
    defaultValue: TipoReserva.Comun,
  }));

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
    label: 'Cantidad total de personas',
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

  protected readonly horaInicioField: FormFieldConfig = {
    key: 'horaInicio',
    label: 'Hora de inicio',
    type: 'time',
    required: true,
  };

  protected readonly horaFinField: FormFieldConfig = {
    key: 'horaFin',
    label: 'Hora de fin',
    type: 'time',
    required: true,
  };

  // --- Sección de cliente (tipo Común) ---

  /** Campo de sólo lectura que muestra el tipo del cliente encontrado (no se elige). */
  protected readonly tipoClienteDisplayField: FormFieldConfig = {
    key: 'tipoCliente',
    label: 'Tipo de cliente',
    type: 'text',
  };

  /** Etiqueta legible del tipo del cliente encontrado. */
  protected readonly tipoClienteLabel = computed<string | null>(() => {
    const tipo = this.clienteBusqueda()?.tipoCliente;
    return TIPO_CLIENTE_FORM_OPTIONS.find((o) => o.value === tipo)?.label ?? null;
  });

  protected readonly cedulaField = computed<FormFieldConfig>(() => ({
    key: 'cedula',
    label: 'Cédula',
    type: 'text',
    required: true,
    disabled: this.clientePrellenado(),
  }));

  protected readonly nombreField: FormFieldConfig = {
    key: 'nombre',
    label: 'Nombre',
    type: 'text',
    required: true,
  };

  protected readonly celularField: FormFieldConfig = {
    key: 'celular',
    label: 'Celular',
    type: 'text',
    required: true,
  };

  protected readonly emailField: FormFieldConfig = {
    key: 'email',
    label: 'Email',
    type: 'text',
  };

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
      horaInicio: this.modoHora() ? this.controlValue('horaInicio') : null,
      horaFin: this.modoHora() ? this.controlValue('horaFin') : null,
      cantidadTotal: this.modoCapacidad()
        ? parseNumberOrNull(this.controlValue('cantidadTotal'))
        : null,
      cantidadMenores: this.modoCapacidad()
        ? parseNumberOrNull(this.controlValue('cantidadMenores'))
        : null,
      cantidad: this.modoCantidad() ? parseNumberOrNull(this.controlValue('cantidad')) : null,
      clienteId: cliente?.id ?? null,
      // Reserva común sin cliente encontrado: se enviaron datos básicos para que el backend lo cree.
      crearCliente: !colaboracion && cliente === null,
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
