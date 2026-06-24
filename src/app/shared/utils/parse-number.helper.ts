/**
 * Convierte el valor de un campo de formulario (que se guarda como string) a número.
 * Devuelve `null` para vacío/`null`/no numérico, distinguiéndolo del `0` legítimo.
 */
export function parseNumberOrNull(value: string | null): number | null {
  if (value === null || value === '') return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}
