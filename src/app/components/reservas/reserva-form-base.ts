import { computed, DestroyRef, Directive, inject, input, signal, Signal } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  catchError,
  debounceTime,
  finalize,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import {
  applySectionChange,
  markFieldAsTouched,
  parseNumberOrNull,
  Procedencia,
  PROCEDENCIA_OPTIONS,
  rangoOcupacionAnual,
  type FormFieldConfig,
  type FormFieldOption,
} from '../../shared';
import { TipoCliente } from '../clientes/models/cliente.model';
import { ClienteValidacionesService } from '../clientes/services/cliente-validaciones.service';
import {
  EstadoServicio,
  ServicioFechaOcupadaDto,
  ServicioRespuestaDto,
} from '../servicios/models/servicio.model';
import { ServicioService } from '../servicios/services/servicio.service';
import { mapServiciosReserva } from './mappers/servicio-reserva.mapper';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { ReservaValidacionesService } from './services/reserva-validaciones.service';
import {
  ClienteBusquedaReservaDto,
  CostoReservaRequestDto,
  PlazoConfirmacion,
  requierePlazoConfirmacion,
  TipoDocumento,
  TipoReserva,
} from './models/reserva.model';
import { ReservasService } from './services/reservas.service';

/**
 * Lógica común del formulario de reserva: orquestación de servicios/fechas según
 * procedencia y servicio, modo capacidad/cantidad, validadores condicionales, estado
 * de la sección de cliente y cálculo de costo.
 * La lógica de búsqueda activa de cliente es responsabilidad de cada subclase.
 */
@Directive()
export abstract class ReservaFormBase {
  protected readonly router = inject(Router);
  protected readonly route = inject(ActivatedRoute);
  protected readonly servicioService = inject(ServicioService);
  protected readonly reservasService = inject(ReservasService);
  protected readonly validaciones = inject(ReservaValidacionesService);
  protected readonly clienteValidaciones = inject(ClienteValidacionesService);
  protected readonly errorHandler = inject(ErrorHandlerService);
  protected readonly destroyRef = inject(DestroyRef);

  protected readonly form: FormGroup;
  protected readonly formEvents: Signal<unknown>;
  private readonly blurCount = signal(0);
  protected readonly tipoDocumentoValue = signal<TipoDocumento>(TipoDocumento.Cedula);

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly costo = signal<number | null>(null);
  protected readonly costoCargando = signal(false);

  protected readonly servicios = signal<ServicioRespuestaDto[]>([]);
  protected readonly fechasOcupadas = signal<ServicioFechaOcupadaDto[]>([]);
  protected readonly clienteBusqueda = signal<ClienteBusquedaReservaDto | null>(null);
  protected readonly clientePrellenado = signal(false);
  protected readonly busquedaRealizada = signal(false);

  protected readonly recalcularCosto = new Subject<void>();

  protected readonly tipoReservaValue = signal<TipoReserva>(TipoReserva.Comun);
  protected readonly servicioIdValue = signal<number | null>(null);
  protected readonly tipoClienteValue = signal<TipoCliente | null>(null);

  readonly id = input<string>('');
  protected readonly backLink = computed<string>(() => {
    const from = this.route.snapshot.queryParamMap.get('from');
    return from === 'listado' ? '/reservas' : `/reservas/${this.id()}`;
  });

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
  protected readonly modoHora = computed(
    () => this.servicioSeleccionado()?.modalidadPrecio === 'POR_HORA',
  );

  protected readonly esSocio = computed(() => this.tipoClienteValue() === TipoCliente.Socio);

  /**
   * Verdadero mientras aún no se buscó/confirmó el cliente y hay un costo estimado visible.
   * No aplica en Colaboración: ahí el costo es siempre 0 sin importar el tipo de cliente.
   */
  protected readonly costoEsParaParticular = computed(
    () => this.costo() !== null && !this.busquedaRealizada() && !this.esColaboracion(),
  );

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

  /**
   * El select de plazo de confirmación solo se muestra (y es obligatorio) mientras la reserva
   * requiera seña y/o documentación. La regla en sí vive en `requierePlazoConfirmacion`
   * (reserva.model.ts), que también usa `DetalleReserva`.
   */
  protected readonly mostrarPlazoConfirmacion = computed<boolean>(() => {
    this.formEvents();
    return requierePlazoConfirmacion(
      this.controlChecked('requiereSena'),
      this.controlChecked('requiereDocumentacion'),
    );
  });

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

  protected readonly confirmDisabled: Signal<boolean>;

  protected static buildReservaForm(): FormGroup {
    return new FormGroup({
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
      tipoDocumento: new FormControl<string | null>(TipoDocumento.Cedula),
      documento: new FormControl<string | null>(null),
      nombre: new FormControl<string | null>(null),
      celular: new FormControl<string | null>(null),
      email: new FormControl<string | null>(null),
      numeroSocio: new FormControl<string | null>(null),
      notas: new FormControl<string | null>(null),
      requiereDocumentacion: new FormControl<boolean>(false),
      requiereSena: new FormControl<boolean>(false),
      plazoConfirmacion: new FormControl<PlazoConfirmacion | null>(null),
    });
  }

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(form: FormGroup) {
    this.form = form;
    this.formEvents = toSignal(form.events);

    const formInvalid = toSignal(form.statusChanges, { initialValue: form.status });

    this.confirmDisabled = computed(() => {
      this.formEvents();
      const invalido = formInvalid() === 'INVALID' || this.form.invalid;
      const faltaBusqueda = !this.busquedaRealizada();
      return invalido || faltaBusqueda || this.loading();
    });

    this.escucharCambios();
    this.aplicarValidadoresMonto();
    this.aplicarValidadoresCliente();
    this.aplicarValidadorPlazoConfirmacion();
    this.escucharCostoReserva();
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
      .get('tipoDocumento')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: TipoDocumento) => {
        this.tipoDocumentoValue.set(value);
        this.aplicarValidadorDocumento();
      });

    this.form
      .get('procedencia')
      ?.valueChanges.pipe(
        tap(() => {
          this.servicios.set([]);
          this.form.get('servicioId')?.setValue(null, { emitEvent: true });
        }),
        switchMap((procedencia: Procedencia | null) =>
          procedencia ? this.cargarServiciosPorProcedencia(procedencia) : of(null),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((lista) => {
        if (lista) this.servicios.set(lista);
      });

    this.form
      .get('servicioId')
      ?.valueChanges.pipe(
        map((raw: string | number | null) => (raw == null || raw === '' ? null : Number(raw))),
        tap((id) => {
          this.servicioIdValue.set(id);
          this.aplicarValidadoresMonto();
        }),
        switchMap((id) => {
          const { desde, hasta } = rangoOcupacionAnual();
          return id
            ? this.servicioService.getFechasOcupadas(id, desde, hasta).pipe(
                catchError((err: unknown) => {
                  this.errorHandler.handle(err);
                  return of(null);
                }),
              )
            : of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((fechas) => this.fechasOcupadas.set(fechas ?? []));

    this.form
      .get('tipoCliente')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo: TipoCliente | null) => this.tipoClienteValue.set(tipo));

    this.form
      .get('requiereSena')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.aplicarValidadorPlazoConfirmacion());

    this.form
      .get('requiereDocumentacion')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.aplicarValidadorPlazoConfirmacion());
  }

  /**
   * Devuelve el observable de servicios habilitados para una procedencia.
   * El cascade del listener de procedencia lo usa con switchMap (cancela requests anteriores).
   * La carga inicial de EditarReserva lo llama directamente con emitEvent:false en procedencia,
   * para poder setear servicioId en el callback sin que el cascade lo resetee.
   */
  protected cargarServiciosPorProcedencia(
    procedencia: Procedencia,
  ): Observable<ServicioRespuestaDto[] | null> {
    return this.servicioService
      .getAll({ page: 0, size: 100, filters: { procedencia, estado: EstadoServicio.Habilitado } })
      .pipe(
        map(mapServiciosReserva),
        catchError((err: unknown) => {
          this.errorHandler.handle(err);
          return of(null);
        }),
      );
  }

  private escucharCostoReserva(): void {
    merge(
      this.form.get('tipoReserva')!.valueChanges,
      this.form.get('servicioId')!.valueChanges,
      this.form.get('fechaInicio')!.valueChanges,
      this.form.get('fechaFin')!.valueChanges,
      this.form.get('cantidad')!.valueChanges,
      this.form.get('cantidadTotal')!.valueChanges,
      this.form.get('cantidadMenores')!.valueChanges,
      this.form.get('tipoCliente')!.valueChanges,
      this.form.get('horaInicio')!.valueChanges,
      this.form.get('horaFin')!.valueChanges,
      this.recalcularCosto,
    )
      .pipe(
        debounceTime(300),
        switchMap(() => this.calcularCosto()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((costo) => this.costo.set(costo));
  }

  private calcularCosto(): Observable<number | null> {
    // Colaboración sin fines de lucro es siempre sin costo: no corresponde consultar el
    // backend para calcularlo.
    if (this.esColaboracion()) return of(0);

    const servicioId = this.servicioIdValue();
    const fechaInicio = this.controlValue('fechaInicio');
    const fechaFin = this.controlValue('fechaFin');
    const horaInicio = this.controlValue('horaInicio');
    const horaFin = this.controlValue('horaFin');
    const horasCorrectas = !this.modoHora() || (horaInicio && horaFin);
    if (!servicioId || !fechaInicio || !fechaFin || !horasCorrectas) return of(null);

    const request: CostoReservaRequestDto = {
      servicioId,
      fechaInicio,
      fechaFin,
      horaInicio: horaInicio || null,
      horaFin: horaFin || null,
      cantidadTotal: this.modoCapacidad()
        ? parseNumberOrNull(this.controlValue('cantidadTotal'))
        : null,
      cantidadMenores: this.modoCapacidad()
        ? parseNumberOrNull(this.controlValue('cantidadMenores'))
        : null,
      cantidad: this.modoCantidad() ? parseNumberOrNull(this.controlValue('cantidad')) : null,
      tipoCliente: this.tipoClienteValue(),
    };

    this.costoCargando.set(true);
    return this.reservasService.calcularCosto(request).pipe(
      map((respuesta) => respuesta.costoTotal),
      catchError((err: unknown) => {
        this.errorHandler.handle(err);
        return of(null);
      }),
      finalize(() => this.costoCargando.set(false)),
    );
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

    const horaInicio = this.form.get('horaInicio');
    const horaFin = this.form.get('horaFin');
    if (this.modoHora()) {
      horaInicio?.setValidators([Validators.required]);
      horaFin?.setValidators([Validators.required]);
    } else {
      horaInicio?.clearValidators();
      horaFin?.clearValidators();
    }
    horaInicio?.updateValueAndValidity({ emitEvent: false });
    horaFin?.updateValueAndValidity({ emitEvent: false });
  }

  /** Activa los validadores de la sección de cliente según el tipo de reserva. */
  protected aplicarValidadoresCliente(): void {
    // El tipo de cliente se deriva de la búsqueda (Particular si no existe).
    const requeridosComun = ['nombre', 'celular'];
    const colaboracion = this.esColaboracion();
    const tipoDocumentoControl = this.form.get('tipoDocumento');

    // En Colaboración el documento queda fijo en RUT y no editable.
    if (colaboracion) {
      tipoDocumentoControl?.setValue(TipoDocumento.Rut, { emitEvent: false });
      tipoDocumentoControl?.disable({ emitEvent: false });
      this.tipoDocumentoValue.set(TipoDocumento.Rut);
    } else {
      tipoDocumentoControl?.enable({ emitEvent: false });
    }

    for (const key of requeridosComun) {
      const control = this.form.get(key);
      if (colaboracion) control?.clearValidators();
      else control?.setValidators(Validators.required);
      control?.updateValueAndValidity({ emitEvent: false });
    }

    this.aplicarValidadorDocumento();
  }

  /** Aplica cedulaValida o rutValida sobre `documento` según el tipoDocumento seleccionado. */
  private aplicarValidadorDocumento(): void {
    const documento = this.form.get('documento');
    const tipoDocumento = this.form.get('tipoDocumento')?.value as TipoDocumento | null;

    const validadorFormato: ValidatorFn =
      tipoDocumento === TipoDocumento.Rut
        ? this.clienteValidaciones.rutValida.bind(this.clienteValidaciones)
        : this.clienteValidaciones.cedulaValida.bind(this.clienteValidaciones);

    documento?.setValidators([Validators.required, validadorFormato]);
    documento?.updateValueAndValidity({ emitEvent: false });
  }

  private aplicarValidadorPlazoConfirmacion(): void {
    const plazoConfirmacion = this.form.get('plazoConfirmacion');
    const requiereAlguno = requierePlazoConfirmacion(
      this.controlChecked('requiereSena'),
      this.controlChecked('requiereDocumentacion'),
    );

    if (requiereAlguno) {
      plazoConfirmacion?.setValidators(Validators.required);
    } else {
      plazoConfirmacion?.setValue(null, { emitEvent: false });
      plazoConfirmacion?.clearValidators();
    }
    plazoConfirmacion?.updateValueAndValidity({ emitEvent: false });
  }

  /** Carga los datos de un cliente (búsqueda o precarga) y deja los campos en sólo lectura. */
  protected aplicarCliente(cliente: ClienteBusquedaReservaDto): void {
    this.clienteBusqueda.set(cliente);
    this.busquedaRealizada.set(true);
    this.tipoClienteValue.set(cliente.tipoCliente);
    // El documento se escribe sin emitir: es resultado de la búsqueda, no una edición del
    // usuario, así que no debe invalidar la verificación recién hecha.
    this.form.get('documento')?.setValue(cliente.documento, { emitEvent: false });
    this.form.get('tipoDocumento')?.setValue(cliente.tipoDocumento, { emitEvent: false });
    this.tipoDocumentoValue.set(cliente.tipoDocumento);
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

  protected controlValue(key: string): string | null {
    return (this.form.get(key)?.value as string | null) ?? null;
  }

  /** Valor booleano de un control (usado por los checkboxes nativos, p. ej. requiereDocumentacion/requiereSena). */
  protected controlChecked(key: string): boolean {
    return Boolean(this.form.get(key)?.value);
  }

  /** Aplica el cambio de un checkbox nativo al FormGroup. */
  protected onCheckboxChange(key: string, checked: boolean): void {
    this.form.get(key)?.setValue(checked);
    this.form.get(key)?.markAsDirty();
  }

  /** Extrae el estado checked de un evento de input[type=checkbox], para usar inline en el template. */
  protected checkboxChecked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  protected onCancelar(): void {
    this.router.navigate(['/reservas']);
  }

  protected onConfirmar(): void {
    this.submitted.set(true);
  }

  // --- Configuración de campos compartida entre alta y edición ---

  protected readonly procedenciaField: FormFieldConfig = {
    key: 'procedencia',
    label: 'Procedencia',
    type: 'select',
    required: true,
    placeholder: 'Seleccione una procedencia',
    options: PROCEDENCIA_OPTIONS.filter((option) => option.value !== Procedencia.Ambos),
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

  protected readonly notasField: FormFieldConfig = {
    key: 'notas',
    label: 'Notas / Observaciones',
    type: 'textarea',
    fullWidth: true,
  };

  protected buildCantidades() {
    return {
      cantidadTotal: this.modoCapacidad()
        ? parseNumberOrNull(this.controlValue('cantidadTotal'))
        : null,
      cantidadMenores: this.modoCapacidad()
        ? parseNumberOrNull(this.controlValue('cantidadMenores'))
        : null,
      cantidad: this.modoCantidad() ? parseNumberOrNull(this.controlValue('cantidad')) : null,
    };
  }
}
