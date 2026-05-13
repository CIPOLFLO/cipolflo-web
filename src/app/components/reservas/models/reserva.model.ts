export interface ReservaRow extends Record<string, unknown> {
  id: number;
  cliente: string;
  servicio: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
}
