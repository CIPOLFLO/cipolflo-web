import { PlazoConfirmacion, ReservaRow } from '../models/reserva.model';
import { EstadoReserva } from '../../../shared';

export interface ReservaListadoRow extends ReservaRow {
  requiereAtencion: boolean;
  mensajeAtencion: string;
}

export function mapReservaListadoRow(reserva: ReservaRow): ReservaListadoRow {
  const requiereAtencionRow = requiereAtencion(reserva);
  return {
    ...reserva,
    requiereAtencion: requiereAtencionRow,
    mensajeAtencion: requiereAtencionRow ? mensajeAtencion(reserva) : '',
  };
}

function requiereAtencion(row: ReservaRow): boolean {
  if (row.estadoReserva !== EstadoReserva.Pendiente) return false;
  if (!row.fechaInicioAlerta || !row.fechaLimiteConfirmacion) return false;

  const ahora = new Date();
  const dentroDeVentana =
    ahora >= new Date(row.fechaInicioAlerta) && ahora < new Date(row.fechaLimiteConfirmacion);
  const faltaPagoConfirmacion = row.requiereSena && !row.pago;
  const faltaDocumentacion = row.requiereDocumentacion && !row.tieneDocumentacion;

  return dentroDeVentana && (faltaPagoConfirmacion || faltaDocumentacion);
}

/**
 * El front no recalcula fechas: usa `fechaLimiteConfirmacion` del back tal cual y solo
 * la formatea para el mensaje. La matemática de fechas (offsets, ventana) vive en el back.
 */
const PLAZO_CONFIRMACION_TOOLTIP: Record<PlazoConfirmacion, (limite: string) => string> = {
  [PlazoConfirmacion.VeinticuatroHoras]: (limite) =>
    `Falta seña o documentación. Se cancelará automáticamente el ${limite} (24 hs antes del inicio).`,
  [PlazoConfirmacion.TresMeses]: (limite) =>
    `Falta seña o documentación. Si no se confirma, se cancelará automáticamente el ${limite}.`,
};

function mensajeAtencion(row: ReservaRow): string {
  if (!row.plazoConfirmacion || !row.fechaLimiteConfirmacion) return '';
  const limiteFormateado = formatFechaLimite(row.fechaLimiteConfirmacion);
  return PLAZO_CONFIRMACION_TOOLTIP[row.plazoConfirmacion](limiteFormateado);
}

function formatFechaLimite(fecha: string): string {
  return new Date(fecha).toLocaleString('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
