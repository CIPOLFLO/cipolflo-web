import { EstadoReserva, ESTADO_RESERVA_LABEL, ESTADO_RESERVA_TAG_CLASS } from '../../../shared';
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

const ESTADO_TAG: Record<EstadoReserva, TagView> = Object.fromEntries(
  Object.values(EstadoReserva).map((estado) => [
    estado,
    { label: ESTADO_RESERVA_LABEL[estado], colorClass: ESTADO_RESERVA_TAG_CLASS[estado] },
  ]),
) as Record<EstadoReserva, TagView>;

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
