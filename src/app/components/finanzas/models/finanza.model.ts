import { Procedencia } from 'src/app/shared';

export enum TipoMovimiento {
  Ingreso = 'INGRESO',
  Egreso = 'EGRESO',
}

export interface FinanzaDetalleRespuestaDto {
  id: number;
  codigo: string;
  procedencia: Procedencia;
  servicio: string;
  fecha: string;
  importe: number;
  formaPago: string;
  notas?: string | null;
  fechaRegistro: string;
  registradoPor: string;
  tipoMovimiento: TipoMovimiento;
}
