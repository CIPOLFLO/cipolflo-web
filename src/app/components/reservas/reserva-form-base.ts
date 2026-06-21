import { computed, DestroyRef, Directive, inject, signal, Signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { applySectionChange, markFieldAsTouched, Procedencia } from '../../shared';
import { TipoCliente } from '../clientes/models/cliente.model';
import {
  EstadoServicio,
  ServicioFechaOcupadaDto,
  ServicioRespuestaDto,
} from '../servicios/models/servicio.model';
import { ServicioService } from '../servicios/services/servicio.service';
import { mapServiciosReserva } from './mappers/servicio-reserva.mapper';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ReservaValidacionesService } from './services/reserva-validaciones.service';
import { ClienteBusquedaReservaDto, TipoReserva } from './models/reserva.model';

/**
 * Lógica común del formulario de reserva: orquestación de servicios/fechas según
 * procedencia y servicio, modo capacidad/cantidad, validadores condicionales y estado
 * de la sección de cliente (señales de búsqueda/precarga y computed derivados).
 * La lógica de búsqueda activa de cliente es responsabilidad de cada subclase.
 */
@Directive()
export abstract class ReservaFormBase {
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly servicioService = inject(ServicioService);
  protected readonly validaciones = inject(ReservaValidacionesService);
  protected readonly errorHandler = inject(ErrorHandlerService);
  protected readonly destroyRef = inject(DestroyRef);

  protected readonly form: FormGroup;
  private readonly formEvents: Signal<unknown>;
  private readonly blurCount = signal(0);

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);

  protected readonly servicios = signal<ServicioRespuestaDto[]>([]);
  protected readonly fechasOcupadas = signal<ServicioFechaOcupadaDto[]>([]);
  protected readonly clienteBusqueda = signal<ClienteBusquedaReservaDto | null>(null);
  protected readonly clientePrellenado = signal(false);
  protected readonly busquedaRealizada = signal(false);

  protected readonly tipoReservaValue = signal<TipoReserva>(TipoReserva.Comun);
  protected readonly servicioIdValue = signal<number | null>(null);
  protected readonly tipoClienteValue = signal<TipoCliente | null>(null);

  protected readonly esColaboracion = computed(
    () => this.tipoReservaValue() === TipoReserva.ColaboracionSinFines,
  );

  protected readonly servicioSeleccionado = computed<ServicioRespuestaDto | null>(() => {
    const id = this.servicioIdValue();
    return this.servicios().find((s) => s.id === id) ?? null;
  });

  protected readonly modoCapacidad = computed(
    () => (this.servicioSeleccionado()?.capacidad ?? null) !== null,
  );
  protected readonly modoCantidad = computed(
    () => (this.servicioSeleccionado()?.cantidad ?? null) !== null,
  );

  protected readonly esSocio = computed(() => this.tipoClienteValue() === TipoCliente.Socio);

  protected readonly observacionesCliente = computed(() => {
    const obs = this.clienteBusqueda()?.observaciones?.trim();
    return obs ? obs : null;
  });

  protected readonly mostrarObservaciones = computed(() => this.observacionesCliente() !== null);

  /** Cliente encontrado (o precargado): sus datos se muestran en sólo lectura. */
  protected readonly clienteCamposReadonly = computed(
    () => this.clientePrellenado() || this.clienteBusqueda() !== null,
  );
  /** Búsqueda realizada sin coincidencia: se ingresan los datos básicos manualmente. */
  protected readonly mostrarFormularioManual = computed(
    () => this.busquedaRealizada() && !this.clienteCamposReadonly(),
  );

  protected readonly reservaErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.blurCount();
    return this.validaciones.getReservaErrors(this.form, this.submitted());
  });

  protected readonly clienteErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.blurCount();
    return this.validaciones.getClienteErrors(this.form, this.submitted());
  });

  protected readonly colaboracionErrors = computed<Record<string, string>>(() => {
    this.formEvents();
    this.blurCount();
    return this.validaciones.getColaboracionErrors(this.form, this.submitted());
  });

  protected readonly confirmDisabled: Signal<boolean>;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(form: FormGroup) {
    this.form = form;
    this.formEvents = toSignal(form.events);

    const formInvalid = toSignal(form.statusChanges, { initialValue: form.status });

    this.confirmDisabled = computed(() => {
      this.formEvents();
      const invalido = formInvalid() === 'INVALID' || this.form.invalid;
      const faltaBusqueda = !this.esColaboracion() && !this.busquedaRealizada();
      return invalido || faltaBusqueda || this.loading();
    });

    this.escucharCambios();
    this.aplicarValidadoresMonto();
    this.aplicarValidadoresCliente();
  }

  private escucharCambios(): void {
    this.form
      .get('tipoReserva')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: TipoReserva) => {
        this.tipoReservaValue.set(value);
        this.aplicarValidadoresCliente();
      });

    this.form
      .get('procedencia')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((procedencia: Procedencia | null) => {
        this.servicios.set([]);
        this.form.get('servicioId')?.setValue(null, { emitEvent: true });
        if (procedencia) this.cargarServicios(procedencia);
      });

    this.form
      .get('servicioId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((raw: string | number | null) => {
        const id = raw == null || raw === '' ? null : Number(raw);
        this.servicioIdValue.set(id);
        this.aplicarValidadoresMonto();
        if (id) this.cargarFechasOcupadas(id);
      });

    this.form
      .get('tipoCliente')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo: TipoCliente | null) => this.tipoClienteValue.set(tipo));
  }

  private cargarServicios(procedencia: Procedencia): void {
    // Sólo se ofrecen servicios habilitados de la procedencia; el size amplio evita
    // paginar (el form necesita la lista completa). El mapper desempaqueta la página.
    this.servicioService
      .getAll({
        page: 0,
        size: 100,
        filters: { procedencia, estado: EstadoServicio.Habilitado },
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          console.log('[cargarServicios] respuesta raw:', respuesta);
          this.servicios.set(mapServiciosReserva(respuesta));
        },
        error: (err: unknown) => this.errorHandler.handle(err),
      });
  }

  private cargarFechasOcupadas(servicioId: number): void {
    this.servicioService
      .getFechasOcupadas(servicioId, this.ventanaDesde(), this.ventanaHasta())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (fechas) => this.fechasOcupadas.set(fechas),
        error: (err: unknown) => this.errorHandler.handle(err),
      });
  }

  private ventanaDesde(): string {
    return new Date().toISOString().slice(0, 10);
  }
  private ventanaHasta(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  }

  /** Activa el validador de cantidad según el modo del servicio (capacidad vs cantidad). */
  private aplicarValidadoresMonto(): void {
    const total = this.form.get('cantidadTotal');
    const cantidad = this.form.get('cantidad');
    if (this.modoCapacidad()) {
      total?.setValidators([Validators.required, Validators.min(0)]);
      cantidad?.clearValidators();
    } else if (this.modoCantidad()) {
      cantidad?.setValidators([Validators.required, Validators.min(0)]);
      total?.clearValidators();
    } else {
      total?.clearValidators();
      cantidad?.clearValidators();
    }
    total?.updateValueAndValidity({ emitEvent: false });
    cantidad?.updateValueAndValidity({ emitEvent: false });
  }

  /** Activa los validadores de la sección de cliente según el tipo de reserva. */
  private aplicarValidadoresCliente(): void {
    // El tipo de cliente ya no se elige: se deriva de la búsqueda (Particular si no existe).
    const requeridosComun = ['cedula', 'nombre', 'celular'];
    const requeridosColab = ['nombreColaboracion'];
    const colaboracion = this.esColaboracion();

    for (const key of requeridosComun) {
      const control = this.form.get(key);
      if (colaboracion) control?.clearValidators();
      else control?.setValidators(Validators.required);
      control?.updateValueAndValidity({ emitEvent: false });
    }
    for (const key of requeridosColab) {
      const control = this.form.get(key);
      if (colaboracion) control?.setValidators(Validators.required);
      else control?.clearValidators();
      control?.updateValueAndValidity({ emitEvent: false });
    }
  }

  /** Carga los datos de un cliente (búsqueda o precarga) y deja los campos en sólo lectura. */
  protected aplicarCliente(cliente: ClienteBusquedaReservaDto): void {
    this.clienteBusqueda.set(cliente);
    this.busquedaRealizada.set(true);
    this.tipoClienteValue.set(cliente.tipoCliente);
    // La cédula se escribe sin emitir: es resultado de la búsqueda, no una edición del
    // usuario, así que no debe invalidar la verificación recién hecha.
    this.form.get('cedula')?.setValue(cliente.cedula, { emitEvent: false });
    this.form.patchValue({
      tipoCliente: cliente.tipoCliente,
      nombre: cliente.nombre,
      celular: cliente.telefono,
      email: cliente.email,
      numeroSocio: cliente.numeroSocio === null ? null : String(cliente.numeroSocio),
    });
  }

  /** Aplica el cambio de un único control (evita reemitir valores obsoletos de otros campos). */
  protected onControlChange(key: string, value: string | null): void {
    applySectionChange(this.form, { [key]: value });
  }

  protected onFieldBlur(key: string): void {
    markFieldAsTouched(this.form, key);
    this.blurCount.update((v) => v + 1);
  }

  protected onCancelar(): void {
    this.router.navigate(['/reservas']);
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
  }
}
