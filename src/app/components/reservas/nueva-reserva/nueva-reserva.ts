import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { catchError, EMPTY, filter, finalize, map, Subject, switchMap } from 'rxjs';
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
  ofrecerComprobante as ofrecerDescargaComprobante,
  OccupancyCalendar,
  PageLayout,
  Procedencia,
  type DateRangeSelection,
  type FormFieldConfig,
  MobPageHeader,
  MobStepper,
  MobStepCard,
  MobStepFooter,
  StepConfig,
  DateFormatPipe,
} from '../../../shared';
import {
  EstadoSocio,
  TipoCliente,
  TIPO_CLIENTE_FORM_OPTIONS,
} from '../../clientes/models/cliente.model';
import { ClientesService } from '../../clientes/services/cliente.service';
import { ReservaFormBase } from '../reserva-form-base';
import {
  PLAZO_CONFIRMACION_OPTIONS,
  PlazoConfirmacion,
  TIPO_RESERVA_OPTIONS,
  TipoDocumento,
  TipoReserva,
  type ClienteBusquedaReservaDto,
  type ReservaCreacionRequestDto,
} from '../models/reserva.model';
import { ReservasService } from '../services/reservas.service';
import { ReservaClienteBusquedaService } from '../services/reserva-cliente-busqueda.service';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { NgTemplateOutlet } from '@angular/common';

interface ReservaSummaryRow {
  label: string;
  value: string;
}

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
    FormsModule,
    RadioButtonModule,
    MobPageHeader,
    MobStepper,
    MobStepCard,
    MobStepFooter,
    NgTemplateOutlet,
  ],
  providers: [ReservasService, ReservaClienteBusquedaService],
  templateUrl: './nueva-reserva.html',
  styleUrl: './nueva-reserva.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NuevaReserva extends ReservaFormBase {
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly errorDialog = inject(ErrorDialogService);
  private readonly clienteBusquedaService = inject(ReservaClienteBusquedaService);
  private readonly clientesService = inject(ClientesService);

  protected readonly breakpoint = inject(BreakpointService);
  protected readonly sidebar = inject(SidebarService);
  /** Expuesto para el template (radio Cédula/RUT). */
  protected readonly TipoDocumento = TipoDocumento;

  protected readonly currentStep = signal(0);

  private readonly dateFormatPipe = new DateFormatPipe();

  protected readonly nextDisabled = computed(() => {
    this.formEvents();

    if (this.currentStep() === 0) {
      return this.pasoReservaInvalido();
    }
    if (this.currentStep() === 1) {
      return this.pasoClienteInvalido();
    }
    return this.confirmDisabled();
  });

  protected readonly steps: StepConfig[] = [
    { label: 'Reserva' },
    { label: 'Cliente' },
    { label: 'Adicional' },
  ];

  protected readonly summaryRows = computed<ReservaSummaryRow[]>(() => {
    this.formEvents();

    const rows: ReservaSummaryRow[] = [
      {
        label: 'Concepto',
        value: this.servicioSeleccionado()?.nombre ?? 'Sin seleccionar',
      },
      {
        label: 'Procedencia',
        value: this.procedenciaLabel(),
      },
      {
        label: 'Fechas',
        value: `${this.formatDate(
          this.controlValue('fechaInicio') as string | null,
        )} - ${this.formatDate(this.controlValue('fechaFin') as string | null)}`,
      },
    ];

    if (this.modoCapacidad()) {
      rows.push({
        label: 'Personas',
        value: String(this.controlValue('cantidadTotal') ?? '—'),
      });
    }

    if (this.modoCantidad()) {
      rows.push({
        label: 'Cantidad',
        value: String(this.controlValue('cantidad') ?? '—'),
      });
    }

    if (this.modoHora()) {
      rows.push({
        label: 'Horario',
        value: `${this.controlValue('horaInicio') ?? '—'} - ${this.controlValue('horaFin') ?? '—'}`,
      });
    }

    rows.push(
      {
        label: 'Cliente',
        value: String(this.controlValue('nombre') ?? 'Sin cliente'),
      },
      {
        label: 'Tipo',
        value: this.tipoClienteLabel() ?? 'Particular',
      },
    );

    return rows;
  });

  protected formatDate(date: string | null): string {
    return date ? this.dateFormatPipe.transform(date) : '--';
  }
  private readonly buscarClienteTrigger = new Subject<{
    documento: string;
    tipoDocumento: TipoDocumento;
  }>();

  constructor() {
    super(ReservaFormBase.buildReservaForm());

    this.form.get('email')?.addValidators(emailValido);
    this.form.get('email')?.updateValueAndValidity({ emitEvent: false });

    // Punto de entrada desde el listado de clientes: precarga del cliente (readonly).
    const clienteId = this.route.snapshot.queryParamMap.get('clienteId');
    if (clienteId) {
      this.clientePrellenado.set(true);
      this.clienteBusquedaService
        .buscarPorId(Number(clienteId))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((cliente) => this.aplicarCliente(cliente));
    }

    // Si el usuario edita el documento (o cambia Cédula/RUT) después de verificar, se
    // invalida la búsqueda para evitar que queden datos de un cliente que ya no corresponde.
    this.form
      .get('documento')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.busquedaRealizada()) this.resetearBusquedaCliente();
      });

    this.form
      .get('tipoDocumento')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.busquedaRealizada()) this.resetearBusquedaCliente();
      });

    this.inicializarBusquedaCliente();
  }

  private inicializarBusquedaCliente(): void {
    this.buscarClienteTrigger
      .pipe(
        switchMap(({ documento, tipoDocumento }) =>
          (tipoDocumento === TipoDocumento.Rut
            ? this.clienteBusquedaService.buscarPorRut(documento)
            : this.clienteBusquedaService.buscarPorCedula(documento)
          ).pipe(
            map((cliente) => ({ cliente, tipoDocumento })),
            finalize(() => this.loading.set(false)),
            catchError((err: unknown) => {
              this.errorHandler.handle(err);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ cliente, tipoDocumento }) => {
        if (cliente) {
          this.busquedaRealizada.set(true);
          this.aplicarCliente(cliente);
          this.recalcularCosto.next();
          return;
        }

        if (tipoDocumento === TipoDocumento.Rut) {
          // RUT no encontrado: bloquea la creación, no habilita campos manuales. Se marca
          // el campo en rojo para que el error siga visible tras cerrar el diálogo.
          this.clienteBusqueda.set(null);
          const documento = this.form.get('documento');
          documento?.setErrors({ rutNoEncontrado: true });
          documento?.markAsTouched();
          this.errorDialog.open({
            title: 'RUT no encontrado',
            message: 'No se encontró ninguna Empresa registrada con ese RUT.',
          });
          return;
        }

        // Cédula no encontrada: comportamiento sin cambios (alta de Particular en el momento).
        this.busquedaRealizada.set(true);
        this.clienteBusqueda.set(null);
        this.habilitarCamposManuales();
        this.recalcularCosto.next();
      });
  }

  protected buscarCliente(): void {
    const documentoControl = this.form.get('documento');
    const documento = (documentoControl?.value as string | null)?.trim();
    documentoControl?.markAsTouched();
    if (!documento || documentoControl?.invalid) return;

    const tipoDocumento =
      (this.form.get('tipoDocumento')?.value as TipoDocumento) ?? TipoDocumento.Cedula;
    this.loading.set(true);
    this.buscarClienteTrigger.next({ documento, tipoDocumento });
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

  // --- Campos específicos de la sección "Información de la Reserva" ---

  protected readonly tipoReservaField = computed<FormFieldConfig>(() => {
    // Colaboración se oculta solo si el cliente precargado no es Empresa.
    const ocultarColaboracion =
      this.clientePrellenado() && this.tipoClienteValue() !== TipoCliente.Empresa;
    return {
      key: 'tipoReserva',
      label: 'Tipo de reserva',
      type: 'select',
      required: true,
      options: ocultarColaboracion
        ? TIPO_RESERVA_OPTIONS.filter((o) => o.value !== TipoReserva.ColaboracionSinFines)
        : TIPO_RESERVA_OPTIONS,
      defaultValue: TipoReserva.Comun,
    };
  });

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

  /**
   * Select condicional (ver `mostrarPlazoConfirmacion()` en ReservaFormBase). Es `required`
   * mientras está visible, por eso -como el resto de los selects obligatorios de este
   * formulario- no lleva opción vacía.
   */
  protected readonly plazoConfirmacionField: FormFieldConfig = {
    key: 'plazoConfirmacion',
    label: 'Plazo para confirmar la reserva',
    type: 'select',
    required: true,
    placeholder: 'Seleccione un plazo',
    options: PLAZO_CONFIRMACION_OPTIONS,
  };

  // --- Sección de cliente ---

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

  /** Documento (cédula o RUT según tipoDocumento), con label dinámico. */
  protected readonly documentoField = computed<FormFieldConfig>(() => ({
    key: 'documento',
    label: this.tipoDocumentoValue() === TipoDocumento.Rut ? 'RUT' : 'Cédula',
    type: 'text',
    required: true,
    disabled: this.clientePrellenado(),
  }));

  /** Radio Cédula/RUT deshabilitado en Colaboración (fijo en RUT) o en precarga. */
  protected readonly documentoRadioDisabled = computed(
    () => this.clientePrellenado() || this.esColaboracion(),
  );

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

  protected readonly lupitaVisible = computed(() => !this.clientePrellenado());

  protected onRangoSeleccionado(rango: DateRangeSelection): void {
    this.onControlChange('fechaInicio', rango.inicio);
    this.onControlChange('fechaFin', rango.fin);
  }

  protected next(): void {
    if (this.nextDisabled()) return;

    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update((step) => step + 1);
    }
  }

  protected previous(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update((step) => step - 1);
    }
  }

  protected procedenciaLabel(): string {
    const value = this.controlValue('procedencia');

    const option = this.procedenciaField.options?.find((o) => o.value === value);

    return option?.label ?? 'Sin seleccionar';
  }

  private pasoReservaInvalido(): boolean {
    const controlesBase = ['tipoReserva', 'procedencia', 'servicioId', 'fechaInicio', 'fechaFin'];

    const controlesCondicionales: string[] = [];

    if (this.modoCapacidad()) {
      controlesCondicionales.push('cantidadTotal');
    }

    if (this.modoCantidad()) {
      controlesCondicionales.push('cantidad');
    }

    if (this.modoHora()) {
      controlesCondicionales.push('horaInicio', 'horaFin');
    }

    return [...controlesBase, ...controlesCondicionales].some(
      (key) => this.form.get(key)?.invalid ?? true,
    );
  }

  private pasoClienteInvalido(): boolean {
    const documentoInvalido = this.form.get('documento')?.invalid ?? true;

    if (!this.busquedaRealizada()) {
      return true;
    }

    if (this.clienteCamposReadonly()) {
      return documentoInvalido;
    }

    const nombreInvalido = this.form.get('nombre')?.invalid ?? true;
    const celularInvalido = this.form.get('celular')?.invalid ?? true;
    const emailInvalido = this.form.get('email')?.invalid ?? false;

    return documentoInvalido || nombreInvalido || celularInvalido || emailInvalido;
  }

  override onConfirmar(): void {
    super.onConfirmar();
    if (this.form.invalid) return;

    const cliente = this.clienteBusqueda();
    if (this.esSocio() && cliente) {
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
        next: (respuesta) => this.ofrecerComprobante(respuesta.id),
        error: (err: unknown) => this.errorHandler.handle(err),
      });
  }

  /**
   * Tras crear la reserva ofrece descargar el comprobante. En ambos casos se navega al
   * listado de inmediato; si se pidió el comprobante, la descarga sigue en segundo plano.
   */
  private ofrecerComprobante(id: number): void {
    let respondido = false;
    this.confirmDialog
      .open({
        title: 'Reserva creada',
        message: 'La reserva se creó correctamente. ¿Desea descargar el comprobante?',
        confirmButtonLabel: 'Descargar comprobante',
        cancelButtonLabel: 'No, gracias',
        variant: 'success',
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        // Si el componente se destruye (navegación) antes de que el usuario responda, el
        // diálogo global queda huérfano: se cierra explícitamente en vez de dejarlo visible.
        finalize(() => {
          if (!respondido) this.confirmDialog.close();
        }),
      )
      .subscribe((descargar) => {
        respondido = true;
        if (descargar) this.descargarComprobante(id);
        this.router.navigate(['/reservas']);
      });
  }

  private descargarComprobante(id: number): void {
    // Fire-and-forget: la descarga NO se ata al destroyRef porque debe sobrevivir a la
    // navegación al listado. La request corre en servicios root; se auto-completa al
    // terminar el HTTP y los errores se muestran vía el diálogo global.
    this.reservasService
      .descargarComprobante(id)
      .pipe(
        catchError((err: unknown) => {
          this.errorHandler.handle(err);
          return EMPTY;
        }),
      )
      .subscribe();
  }

  private construirDto(): ReservaCreacionRequestDto {
    const tipoReserva = (this.controlValue('tipoReserva') as TipoReserva) ?? TipoReserva.Comun;
    const cliente: ClienteBusquedaReservaDto | null = this.clienteBusqueda();
    const crearCliente = !this.esColaboracion() && cliente === null;

    return {
      tipoReserva,
      procedencia: this.controlValue('procedencia') as Procedencia,
      servicioId: Number(this.controlValue('servicioId')),
      fechaInicio: this.controlValue('fechaInicio')!,
      fechaFin: this.controlValue('fechaFin')!,
      ...this.buildCantidades(),
      horaInicio: this.modoHora() ? this.controlValue('horaInicio') : null,
      horaFin: this.modoHora() ? this.controlValue('horaFin') : null,
      clienteId: cliente?.id ?? null,
      crearCliente,
      tipoCliente: this.controlValue('tipoCliente') as TipoCliente | null,
      cedula: crearCliente ? this.controlValue('documento') : null,
      nombre: this.controlValue('nombre'),
      celular: this.controlValue('celular'),
      email: this.controlValue('email'),
      notas: this.controlValue('notas'),
      requiereDocumentacion: this.controlChecked('requiereDocumentacion'),
      requiereSena: this.controlChecked('requiereSena'),
      plazoConfirmacion: this.controlValue('plazoConfirmacion') as PlazoConfirmacion | null,
    };
  }
}
