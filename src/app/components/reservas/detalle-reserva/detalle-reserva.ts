import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, filter, map, switchMap } from 'rxjs';
import {
  AppButton,
  DetailRegistroSection,
  DetailSection,
  ESTADO_RESERVA_LABEL,
  ESTADO_RESERVA_VALUE_CLASS,
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
  TIPO_CLIENTE_LABEL,
  TIPO_RESERVA_LABEL,
  TipoReserva,
} from '../models/reserva.model';

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
  private readonly destroyRef = inject(DestroyRef);

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
    ];

    const CAMPOS_PAGO = ['importe', 'formaPago', 'pago'];
    return e.tipoReserva === TipoReserva.ColaboracionSinFines
      ? fields.filter((f) => !CAMPOS_PAGO.includes(f.key))
      : fields;
  });

  protected readonly clienteFields = computed<DetailFieldConfig[]>(() => {
    const e = this.reserva();
    if (!e) return [];
    if (e.tipoReserva === TipoReserva.ColaboracionSinFines) {
      return [
        { key: 'rut', label: 'RUT', value: e.rut },
        { key: 'nombre', label: 'Nombre', value: e.nombre },
      ];
    }
    const c = e.cliente;
    if (!c) return [];
    return [
      { key: 'tipoCliente', label: 'Tipo de Cliente', value: TIPO_CLIENTE_LABEL[c.tipoCliente] },
      { key: 'cedula', label: 'Cédula', value: c.cedula },
      { key: 'nombre', label: 'Nombre', value: c.nombre },
      { key: 'telefono', label: 'Teléfono', value: c.telefono },
      { key: 'email', label: 'Email', value: c.email },
    ];
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

  protected onModificar(): void {
    this.router.navigate(['/reservas', this.reservaId(), 'modificar'], {
      queryParams: { from: 'detalle' },
    });
  }

  protected onDescargarComprobante(): void {
    const id = this.reserva()?.id;
    if (id == null) return;
    this.reservasService
      .descargarComprobante(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err: unknown) => {
          this.errorHandler.handle(err);
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
