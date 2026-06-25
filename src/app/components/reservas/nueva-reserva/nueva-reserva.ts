import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { catchError, EMPTY, filter, finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AppButton,
  ConfirmDialogComponent,
  ConfirmDialogService,
  CurrencyFormatPipe,
  emailValido,
  ErrorDialogComponent,
  ErrorDialogService,
  FormActions,
  FormField,
  FormLayout,
  FormSection,
  OccupancyCalendar,
  PageLayout,
  Procedencia,
  type DateRangeSelection,
  type FormFieldConfig,
} from '../../../shared';
import {
  EstadoSocio,
  TipoCliente,
  TIPO_CLIENTE_FORM_OPTIONS,
} from '../../clientes/models/cliente.model';
import { ClientesService } from '../../clientes/services/cliente.service';
import { ReservaFormBase } from '../reserva-form-base';
import {
  TIPO_RESERVA_OPTIONS,
  TipoReserva,
  type ReservaCreacionRequestDto,
} from '../models/reserva.model';
import { ReservasService } from '../services/reservas.service';
import { ReservaClienteBusquedaService } from '../services/reserva-cliente-busqueda.service';
import { Subject } from 'rxjs';

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
  private readonly clienteBusquedaService = inject(ReservaClienteBusquedaService);
  private readonly clientesService = inject(ClientesService);

  private readonly buscarClienteTrigger = new Subject<string>();

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

    // Si el usuario edita la cédula después de verificar, se invalida la búsqueda para
    // evitar que queden datos de un cliente asociados a una cédula que ya no corresponde.
    this.form
      .get('cedula')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.busquedaRealizada()) this.resetearBusquedaCliente();
      });

    this.inicializarBusquedaCliente();
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
    const cedula = (this.form.get('cedula')?.value as string | null)?.trim();
    if (!cedula) {
      this.onFieldBlur('cedula');
      return;
    }
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

  // --- Campos específicos de la sección "Información de la Reserva" ---

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

  protected readonly lupitaVisible = computed(
    () => !this.clientePrellenado() && !this.esColaboracion(),
  );

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
      ...this.buildCantidades(),
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
