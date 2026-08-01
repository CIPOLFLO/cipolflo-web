import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../models/error-response.model';

export const ERROR_CODES: Record<string, string> = {
  // Agregar entradas a medida que el backend define nuevos códigos.
  // Formato: 'CODIGO_DEL_BACK': 'Mensaje legible para el usuario'
  // Ejemplo:
  SERVICIO_CON_RESERVAS_ACTIVAS: 'El servicio tiene reservas activas y no puede ser deshabilitado.',
  ELIMINACION_PAGO_CUOTA_NO_PERMITIDA:
    'Los pagos de cuota no pueden eliminarse. La anulación de cuotas es una funcionalidad pendiente.',
  ELIMINACION_EGRESO_RESERVA_NO_PERMITIDA:
    'Los egresos asociados a una reserva no pueden eliminarse. Si se cargó por error, registrá un ingreso que lo anule.',
  CONFIRMACION_ELIMINACION_REQUERIDA:
    'El movimiento corresponde a una reserva ya finalizada o cancelada.',
  CHAT_ID_DUPLICADO: 'Ya existe un cliente autorizado de Telegram con ese Chat ID.',
  CHAT_NO_ENCONTRADO: 'El cliente autorizado de Telegram no fue encontrado.',
  DESTINATARIO_NO_ENCONTRADO: 'El destinatario de notificaciones no fue encontrado.',
  MANUAL_NO_ENCONTRADO: 'El manual solicitado no existe.',
  MANUAL_NO_DISPONIBLE: 'El manual todavía está en preparación y no puede descargarse.',
};

/**
 * Resuelve el mensaje legible de un error HTTP: prioriza el mapeo de `ERROR_CODES`
 * y cae en la `descripcion` del backend (sanitizada) o en un texto genérico.
 */
export function resolveErrorMessage(error: unknown): string {
  const generico = 'Ocurrió un error inesperado. Por favor, intentá de nuevo.';

  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ErrorResponse> | null;

    if (body?.codigo) {
      return ERROR_CODES[body.codigo] ?? sanitizarDescripcion(body.descripcion) ?? generico;
    }
  }

  return generico;
}

/**
 * Errores de deserialización de enums (código genérico SOLICITUD_INVALIDA) traen, además
 * del campo inválido, la lista completa de valores aceptados por el backend. Esa lista es
 * un detalle técnico que no debe llegar al usuario final, así que se descarta.
 */
function sanitizarDescripcion(descripcion: string | undefined): string | undefined {
  if (!descripcion) return undefined;

  const texto = descripcion.split('Valores aceptados')[0].trim();
  if (!texto) return undefined;

  return `${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;
}
