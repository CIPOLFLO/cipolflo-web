import { Procedencia } from '../../../shared';
import { type AuditInfoDto } from '../../../shared';

export enum TipoMovimiento {
  Ingreso = 'INGRESO',
  Egreso = 'EGRESO',
}

export interface FinanzaDetalleRespuestaDto extends AuditInfoDto {
  id: number;
  codigo: string;
  procedencia: Procedencia;
  servicio: string;
  fecha: string;
  importe: number;
  formaPago: string;
  notas?: string | null;
  tipoMovimiento: TipoMovimiento;
}
