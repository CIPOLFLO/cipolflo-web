import { EstadoReserva } from '../../../shared';
import { ReservaRow } from '../models/reserva.model';
import { DateFormatPipe } from '../../../shared/components/table/pipes/date-format.pipe';

interface TagView {
  label: string;
  colorClass: string;
}

export interface ReservaCardMobileRow extends ReservaRow {
  cliente: string;
  servicio: string;
  fechaEntradaFormateada: string;
  fechaSalidaFormateada: string;
  estadoTag: TagView;
}

const ESTADO_TAG: Record<EstadoReserva, TagView> = {
  [EstadoReserva.Confirmada]: {
    label: 'Confirmada',
    colorClass: 'tag--green',
  },
  [EstadoReserva.EnCurso]: {
    label: 'En curso',
    colorClass: 'tag--blue',
  },
  [EstadoReserva.Finalizada]: {
    label: 'Finalizada',
    colorClass: 'tag--purple',
  },
  [EstadoReserva.Cancelada]: {
    label: 'Cancelada',
    colorClass: 'tag--gray',
  },
  [EstadoReserva.Pendiente]: {
    label: 'Pendiente',
    colorClass: 'tag--yellow',
  },
  [EstadoReserva.VencidaSinPago]: {
    label: 'Vencida sin pago',
    colorClass: 'tag--red',
  },
};

const dateFormatPipe = new DateFormatPipe();

export function mapReservaCardMobileRow(reserva: ReservaRow): ReservaCardMobileRow {
  return {
    ...reserva,
    cliente: reserva.nombreCliente,
    servicio: reserva.servicioNombre,
    fechaEntradaFormateada: formatDate(reserva.fechaEntrada),
    fechaSalidaFormateada: formatDate(reserva.fechaSalida),
    estadoTag: ESTADO_TAG[reserva.estadoReserva],
  };
}

function formatDate(date: string): string {
  return dateFormatPipe.transform(date);
}