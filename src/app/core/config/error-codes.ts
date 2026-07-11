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
};

/**
 * Resuelve el mensaje legible de un error HTTP: prioriza el mapeo de `ERROR_CODES`
 * y cae en la `descripcion` del backend o en un texto genérico.
 */
export function resolveErrorMessage(error: unknown): string {
  const generico = 'Ocurrió un error inesperado. Por favor, intentá de nuevo.';

  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ErrorResponse> | null;

    if (body?.codigo) {
      return ERROR_CODES[body.codigo] ?? body.descripcion ?? generico;
    }
  }

  return generico;
}
