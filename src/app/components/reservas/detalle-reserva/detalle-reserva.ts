import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, filter, finalize, map, of, switchMap } from 'rxjs';
import {
  AppButton,
  DateTimeFormatPipe,
  DetailRegistroSection,
  DetailSection,
  ESTADO_RESERVA_LABEL,
  ESTADO_RESERVA_VALUE_CLASS,
  esReservaEditable,
  FormActions,
  FormLayout,
  PageLayout,
  PROCEDENCIA_LABEL,
  type DetailFieldConfig,
  type DetailRegistroData,
} from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ReservasService } from '../services/reservas.service';
import {
  FORMA_PAGO_RESERVA_LABEL,
  PLAZO_CONFIRMACION_LABEL,
  requierePlazoConfirmacion,
  TIPO_RESERVA_LABEL,
  TipoReserva,
  type ReservaDetalleRespuestaDto,
} from '../models/reserva.model';
import { buildClienteReservaFields } from '../mappers/cliente-reserva-fields.mapper';
import { HistorialPagosSection } from '../historial-pagos-section/historial-pagos-section';

const dateTimeFormatPipe = new DateTimeFormatPipe();

@Component({
  selector: 'app-detalle-reserva',
  imports: [
    CommonModule,
    PageLayout,
    FormLayout,
    FormActions,
    AppButton,
    DetailSection,
    DetailRegistroSection,
    HistorialPagosSection,
  ],
  providers: [ReservasService],
  templateUrl: './detalle-reserva.html',
  styleUrl: './detalle-reserva.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleReserva {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly reservasService = inject(ReservasService);
  private readonly errorHandler = inject(ErrorHandlerService);

  protected readonly reservaId = toSignal(this.route.paramMap.pipe(map((p) => p.get('id') ?? '')), {
    initialValue: '',
  });

  protected readonly reserva = toSignal(
    toObservable(this.reservaId).pipe(
      filter((id) => /^\d+$/.test(id)),
      switchMap((id) =>
        this.reservasService.getById(Number(id)).pipe(
          catchError((err) => {
            this.errorHandler.handle(err);
            this.router.navigate(['/reservas']);
            return EMPTY;
          }),
        ),
      ),
    ),
    { initialValue: undefined },
  );

  protected readonly esColaboracion = computed(
    () => this.reserva()?.tipoReserva === TipoReserva.ColaboracionSinFines,
  );

  protected readonly reservaFields = computed<DetailFieldConfig[]>(() => {
    const e = this.reserva();
    if (!e) return [];
    const requiereAlgunPlazo = requierePlazoConfirmacion(e.requiereSena, e.requiereDocumentacion);
    const fields: DetailFieldConfig[] = [
      { key: 'tipoReserva', label: 'Tipo de Reserva', value: TIPO_RESERVA_LABEL[e.tipoReserva] },
      {
        key: 'estado',
        label: 'Estado',
        value: ESTADO_RESERVA_LABEL[e.estado],
        valueClass: ESTADO_RESERVA_VALUE_CLASS[e.estado],
      },
      {
        key: 'procedencia',
        label: 'Procedencia',
        value: PROCEDENCIA_LABEL[e.procedencia] ?? e.procedencia,
      },
      { key: 'servicio', label: 'Servicio', value: e.servicio.nombre },
      { key: 'fechaEntrada', label: 'Fecha de Entrada', value: e.fechaEntrada },
      { key: 'fechaSalida', label: 'Fecha de Salida', value: e.fechaSalida },
      ...(e.horaInicio !== null
        ? [{ key: 'horaInicio', label: 'Hora de Inicio', value: e.horaInicio }]
        : []),
      ...(e.horaFin !== null ? [{ key: 'horaFin', label: 'Hora de Fin', value: e.horaFin }] : []),
      ...(e.cantidadTotal !== null
        ? [
            {
              key: 'cantidadTotal',
              label: 'Cantidad de Personas',
              value: e.cantidadTotal.toString(),
            },
            ...(e.cantidadMenores !== null
              ? [{ key: 'cantidadMenores', label: 'Menores', value: e.cantidadMenores.toString() }]
              : []),
          ]
        : []),
      ...(e.cantidad !== null
        ? [{ key: 'cantidad', label: 'Cantidad', value: e.cantidad.toString() }]
        : []),
      ...(e.importe !== null
        ? [{ key: 'importe', label: 'Importe', value: `$ ${e.importe.toLocaleString('es-UY')}` }]
        : []),
      ...(e.formaPago !== null
        ? [
            {
              key: 'formaPago',
              label: 'Forma de Pago',
              value: FORMA_PAGO_RESERVA_LABEL[e.formaPago] ?? e.formaPago,
            },
          ]
        : []),
      {
        key: 'pago',
        label: 'Pago',
        value: e.pago ? 'Sí' : 'No',
        valueClass: e.pago ? 'success' : 'danger',
      },
      {
        key: 'requiereSena',
        label: 'Requiere Seña',
        value: e.requiereSena ? 'Sí' : 'No',
      },
      {
        key: 'requiereDocumentacion',
        label: 'Requiere Documentación',
        value: e.requiereDocumentacion ? 'Sí' : 'No',
      },
      ...(e.requiereDocumentacion
        ? [
            {
              key: 'tieneDocumentacion',
              label: 'Tiene Documentación',
              value: e.tieneDocumentacion ? 'Sí' : 'No',
              valueClass: e.tieneDocumentacion ? ('success' as const) : ('danger' as const),
            },
          ]
        : []),
      ...(requiereAlgunPlazo && e.plazoConfirmacion !== null
        ? [
            {
              key: 'plazoConfirmacion',
              label: 'Plazo para Confirmar la Reserva',
              value: PLAZO_CONFIRMACION_LABEL[e.plazoConfirmacion],
            },
          ]
        : []),
      ...(requiereAlgunPlazo && e.fechaLimiteConfirmacion !== null
        ? [
            {
              key: 'fechaLimiteConfirmacion',
              label: 'Fecha Límite de Confirmación',
              value: dateTimeFormatPipe.transform(e.fechaLimiteConfirmacion),
            },
          ]
        : []),
    ];

    const CAMPOS_PAGO = ['importe', 'formaPago', 'pago'];
    return e.tipoReserva === TipoReserva.ColaboracionSinFines
      ? fields.filter((f) => !CAMPOS_PAGO.includes(f.key))
      : fields;
  });

  protected readonly clienteFields = computed<DetailFieldConfig[]>(() => {
    const c = this.reserva()?.cliente;
    return c ? buildClienteReservaFields(c) : [];
  });

  protected readonly adicionalFields = computed<DetailFieldConfig[]>(() => {
    const e = this.reserva();
    if (!e) return [];
    return [
      {
        key: 'notas',
        label: 'Notas / Observaciones',
        value: e.notas,
        fullWidth: true,
        multiline: true,
      },
    ];
  });

  protected readonly registroData = computed<DetailRegistroData | null>(() => {
    const e = this.reserva();
    if (!e) return null;
    return {
      entityId: `RSV-${String(e.id).padStart(3, '0')}`,
      entityIdLabel: 'ID de la Reserva',
      fechaRegistro: e.createdAt,
      registradoPor: e.createdBy,
    };
  });

  protected readonly puedeModificar = computed<boolean>(() => {
    const e = this.reserva();
    return e ? esReservaEditable(e.estado) : false;
  });

  protected onModificar(): void {
    this.router.navigate(['/reservas', this.reservaId(), 'modificar'], {
      queryParams: { from: 'detalle' },
    });
  }

  protected readonly descargando = signal(false);

  protected onDescargarComprobante(): void {
    const id = this.reserva()?.id;
    if (id == null || this.descargando()) return;
    this.descargando.set(true);
    // Fire-and-forget: la descarga NO se ata al destroyRef para que sobreviva si el usuario
    // navega (Modificar, header) mientras corre. La request vive en servicios root, se
    // auto-completa al terminar el HTTP y los errores van al diálogo global. Mientras el
    // usuario siga en pantalla, `descargando` mantiene el botón bloqueado.
    this.reservasService
      .descargarComprobante(id)
      .pipe(
        finalize(() => this.descargando.set(false)),
        catchError((err: unknown) => {
          this.errorHandler.handle(err);
          return EMPTY;
        }),
      )
      .subscribe();
  }

  protected readonly historialPagos = toSignal(
    toObservable(this.reserva).pipe(
      filter((reserva): reserva is ReservaDetalleRespuestaDto => reserva !== undefined),
      switchMap((reserva) =>
        this.reservasService.getHistorialPagos(reserva.id).pipe(
          catchError((err) => {
            this.errorHandler.handle(err);
            return of([]);
          }),
        ),
      ),
    ),
    {
      initialValue: [],
    },
  );
}
