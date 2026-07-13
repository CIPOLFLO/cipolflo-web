import { EstadoReserva } from '../../../shared';
import { ReservaRow } from '../models/reserva.model';

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
};

const DATE_FORMATTER = new Intl.DateTimeFormat('es-UY', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function mapReservaCardMobileRow(reserva: ReservaRow): ReservaCardMobileRow {
  return {
    ...reserva,
    cliente: reserva.nombreCliente,
    servicio: reserva.servicioNombre,
    fechaEntradaFormateada: formatearFecha(reserva.fechaEntrada),
    fechaSalidaFormateada: formatearFecha(reserva.fechaSalida),
    estadoTag: ESTADO_TAG[reserva.estadoReserva],
  };
}

function formatearFecha(fecha: string): string {
  return DATE_FORMATTER.format(new Date(fecha));
}
