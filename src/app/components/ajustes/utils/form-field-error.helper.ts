import { AbstractControl } from '@angular/forms';

/**
 * Recorre `mensajes` en orden y devuelve el mensaje del primer error presente en `control`.
 * `mostrar` es la condición de visibilidad (habitualmente `submitted() || control?.touched`).
 */
export function mensajeErrorControl(
  control: AbstractControl | null | undefined,
  mostrar: boolean,
  mensajes: Record<string, string>,
): string | null {
  if (!mostrar) return null;
  for (const [clave, mensaje] of Object.entries(mensajes)) {
    if (control?.hasError(clave)) return mensaje;
  }
  return null;
}
