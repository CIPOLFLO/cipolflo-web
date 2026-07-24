import { Injectable } from '@angular/core';
import {
  ColumnConfig,
  EstadoReserva,
  ESTADO_RESERVA_LABEL,
  ESTADO_RESERVA_TAG_CLASS,
} from '../../../shared';

@Injectable()
export class ReservasColumnsService {
  readonly columns: ColumnConfig[] = [
    {
      key: 'requiereAtencion',
      label: '',
      cellType: 'warning',
      tooltipKey: 'mensajeAtencion',
      tooltip: 'Debe cumplir los requisitos para evitar la cancelación de la reserva.',
    },
    { key: 'nombreCliente', label: 'Cliente', sortable: true },
    { key: 'servicioNombre', label: 'Servicio' },
    { key: 'fechaEntrada', label: 'Fecha Entrada', sortable: true, cellType: 'date' },
    { key: 'fechaSalida', label: 'Fecha Salida', sortable: true, cellType: 'date' },
    {
      key: 'estadoReserva',
      label: 'Estado',
      cellType: 'tag',
      tagMap: Object.fromEntries(
        Object.values(EstadoReserva).map((estado) => [
          estado,
          { styleClass: ESTADO_RESERVA_TAG_CLASS[estado], label: ESTADO_RESERVA_LABEL[estado] },
        ]),
      ),
    },
  ];
}
