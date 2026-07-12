import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { finalize, map } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AppButton,
  CurrencyFormatPipe,
  DetailRegistroSection,
  DetailSection,
  emailValido,
  FormActions,
  FormField,
  FormLayout,
  FormSection,
  OccupancyCalendar,
  PageLayout,
  Procedencia,
  type DateRangeSelection,
  type DetailFieldConfig,
  type DetailRegistroData,
  type FormFieldConfig,
} from '../../../shared';
import { ReservaFormBase } from '../reserva-form-base';
import {
  TIPO_CLIENTE_LABEL,
  TIPO_RESERVA_LABEL,
  TipoDocumento,
  type ReservaActualizacionRequestDto,
  type ReservaDetalleRespuestaDto,
} from '../models/reserva.model';
import { ReservasService } from '../services/reservas.service';

@Component({
  standalone: true,
  selector: 'app-editar-reserva',
  imports: [
    PageLayout,
    FormLayout,
    FormSection,
    FormField,
    FormActions,
    AppButton,
    OccupancyCalendar,
    DetailSection,
    DetailRegistroSection,
    CurrencyFormatPipe,
  ],
  providers: [ReservasService],
  templateUrl: './editar-reserva.html',
  styleUrl: './editar-reserva.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarReserva extends ReservaFormBase {
  protected readonly reservaId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: '',
  });

  protected readonly reserva = signal<ReservaDetalleRespuestaDto | undefined>(undefined);

  constructor() {
    super(ReservaFormBase.buildReservaForm());

    this.form.get('email')?.addValidators(emailValido);
    this.form.get('email')?.updateValueAndValidity({ emitEvent: false });

    this.cargarReserva();
  }

  // La información del cliente no se modifica, así que no aplican validadores de cliente.
  protected override aplicarValidadoresCliente(): void {
    for (const key of ['documento', 'nombre', 'celular']) {
      const ctrl = this.form.get(key);
      ctrl?.clearValidators();
      ctrl?.updateValueAndValidity({ emitEvent: false });
    }
  }

  private cargarReserva(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || !/^\d+$/.test(idParam)) return;

    this.reservasService
      .getById(Number(idParam))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reserva) => {
          this.reserva.set(reserva);
          this.aplicarFormulario(reserva);
        },
        error: (err: unknown) => {
          this.errorHandler.handle(err);
          this.router.navigate(['/reservas']);
        },
      });
  }

  private aplicarFormulario(reserva: ReservaDetalleRespuestaDto): void {
    this.tipoReservaValue.set(reserva.tipoReserva);

    // Campos sin cascade se patchean sin emitir para no disparar listeners innecesarios.
    this.form.patchValue(
      {
        tipoReserva: reserva.tipoReserva,
        fechaInicio: reserva.fechaEntrada,
        fechaFin: reserva.fechaSalida,
        cantidadTotal: reserva.cantidadTotal?.toString() ?? null,
        cantidadMenores: reserva.cantidadMenores?.toString() ?? null,
        cantidad: reserva.cantidad?.toString() ?? null,
        notas: reserva.notas,
      },
      { emitEvent: false },
    );

    // Procedencia se patchea sin emitir para evitar que el cascade resetee servicioId.
    // Se cargan los servicios manualmente y se setea servicioId una vez que llegan.
    this.form.get('procedencia')?.setValue(reserva.procedencia, { emitEvent: false });
    this.cargarServiciosPorProcedencia(reserva.procedencia)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lista) => {
        if (lista) {
          this.servicios.set(lista);
          this.form.get('servicioId')?.setValue(String(reserva.servicio.id));
        }
      });

    // Precarga los campos del cliente en el form para que los validadores queden satisfechos.
    // Toda reserva (incluida Colaboración) tiene un clienteId real asociado.
    if (reserva.cliente) {
      this.aplicarCliente({
        id: reserva.cliente.id,
        nombre: reserva.cliente.nombre,
        documento: reserva.cliente.cedula ?? '',
        tipoDocumento: TipoDocumento.Cedula,
        tipoCliente: reserva.cliente.tipoCliente,
        numeroSocio: null,
        estado: null,
        telefono: reserva.cliente.telefono,
        email: reserva.cliente.email,
        observaciones: null,
      });
    } else {
      this.busquedaRealizada.set(true);
    }
  }

  protected onRangoSeleccionado(rango: DateRangeSelection): void {
    this.onControlChange('fechaInicio', rango.inicio);
    this.onControlChange('fechaFin', rango.fin);
  }

  override onConfirmar(): void {
    super.onConfirmar();
    if (this.form.invalid) return;
    const id = Number(this.reservaId());
    this.loading.set(true);
    this.reservasService
      .update(id, this.construirDto())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => this.router.navigateByUrl(this.backLink()),
        error: (err: unknown) => this.errorHandler.handle(err),
      });
  }

  override onCancelar(): void {
    this.router.navigateByUrl(this.backLink());
  }

  private construirDto(): ReservaActualizacionRequestDto {
    return {
      procedencia: this.controlValue('procedencia') as Procedencia,
      servicioId: Number(this.controlValue('servicioId')),
      fechaInicio: this.controlValue('fechaInicio')!,
      fechaFin: this.controlValue('fechaFin')!,
      ...this.buildCantidades(),
      notas: this.controlValue('notas'),
    };
  }

  // --- Configuración de campos ---

  protected readonly tipoReservaLabel = computed<string>(() => {
    const r = this.reserva();
    return r ? TIPO_RESERVA_LABEL[r.tipoReserva] : '';
  });

  protected readonly tipoReservaDisplayField: FormFieldConfig = {
    key: 'tipoReserva',
    label: 'Tipo de reserva',
    type: 'text',
    locked: true,
  };

  protected readonly initialCalendarRange = computed<DateRangeSelection>(() => ({
    inicio: this.reserva()?.fechaEntrada ?? null,
    fin: this.reserva()?.fechaSalida ?? null,
  }));

  protected readonly clienteFields = computed<DetailFieldConfig[]>(() => {
    const r = this.reserva();
    if (!r || !r.cliente) return [];
    const c = r.cliente;
    return [
      { key: 'tipoCliente', label: 'Tipo de cliente', value: TIPO_CLIENTE_LABEL[c.tipoCliente] },
      { key: 'cedula', label: 'Cédula', value: c.cedula },
      { key: 'nombre', label: 'Nombre', value: c.nombre },
      { key: 'telefono', label: 'Teléfono', value: c.telefono },
      { key: 'email', label: 'Email', value: c.email },
    ];
  });

  protected readonly registroData = computed<DetailRegistroData | null>(() => {
    const r = this.reserva();
    if (!r) return null;
    return {
      entityId: `RSV-${String(r.id).padStart(3, '0')}`,
      entityIdLabel: 'ID de la Reserva',
      fechaRegistro: r.createdAt,
      registradoPor: r.createdBy,
    };
  });
}