import { Injectable } from '@angular/core';
import { ColumnConfig } from '../../../shared';

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
      tagMap: {
        CONFIRMADA: { styleClass: 'tag--green', label: 'Confirmada' },
        EN_CURSO: { styleClass: 'tag--blue', label: 'En curso' },
        FINALIZADA: { styleClass: 'tag--purple', label: 'Finalizada' },
        CANCELADA: { styleClass: 'tag--gray', label: 'Cancelada' },
        PENDIENTE: { styleClass: 'tag--yellow', label: 'Pendiente' },
      },
    },
  ];
}
