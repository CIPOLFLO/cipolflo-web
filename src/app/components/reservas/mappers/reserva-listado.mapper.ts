import { ReservaRow } from '../models/reserva.model';
import { EstadoReserva } from '../../../shared';

export interface ReservaListadoRow extends ReservaRow {
  requiereAtencion: boolean;
}

export function mapReservaListadoRow(reserva: ReservaRow): ReservaListadoRow {
  return {
    ...reserva,
    requiereAtencion: requiereAtencion(reserva),
  };
}

function requiereAtencion(row: ReservaRow): boolean {
  const ahora = new Date();
  const fechaEntrada = new Date(row.fechaEntrada);

  const diferenciaMs = fechaEntrada.getTime() - ahora.getTime();
  const horasRestantes = diferenciaMs / (1000 * 60 * 60);

  // TODO: Reemplazar las 24 horas por el plazo de confirmación configurado para el servicio
  // cuando esté disponible al crear la reserva.
  const faltan24HorasOMenos = horasRestantes <= 24;

  return faltan24HorasOMenos && row.estadoReserva === EstadoReserva.Pendiente;
}
