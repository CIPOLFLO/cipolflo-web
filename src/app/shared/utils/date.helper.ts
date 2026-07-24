/** Medianoche local de hoy (sin componente horario). */
export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Convierte 'yyyy-MM-dd' a una Date local a medianoche (evita el corrimiento por zona
 * horaria de `new Date(iso)`). Devuelve `null` si la cadena no representa una fecha válida.
 */
export function parseIsoDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/** Formatea una Date como 'yyyy-MM-dd', o `null` si no hay fecha. */
export function toIsoDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Formatea una Date como 'dd/MM/yyyy' para mostrar, o '' si no hay fecha. */
export function toDisplayDate(date: Date | null | undefined): string {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

/** Ventana de un año desde hoy ('yyyy-MM-dd'), usada para consultar ocupación de un servicio. */
export function rangoOcupacionAnual(): { desde: string; hasta: string } {
  const hoy = startOfToday();
  const hasta = new Date(hoy.getFullYear() + 1, hoy.getMonth(), hoy.getDate());
  return { desde: toIsoDate(hoy)!, hasta: toIsoDate(hasta)! };
}
