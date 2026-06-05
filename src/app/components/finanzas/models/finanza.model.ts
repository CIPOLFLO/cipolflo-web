import { Procedencia } from 'src/app/shared';

export enum TipoMovimiento {
  Ingreso = 'INGRESO',
  Egreso = 'EGRESO',
}

export const TIPO_MOVIMIENTO_LABEL: Record<TipoMovimiento, string> = {
  [TipoMovimiento.Ingreso]: 'Ingreso',
  [TipoMovimiento.Egreso]: 'Egreso',
};

export const TIPO_MOVIMIENTO_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Ingreso', value: TipoMovimiento.Ingreso },
  { label: 'Egreso', value: TipoMovimiento.Egreso },
];

export enum Concepto {
  PagoCuota = 'PAGO_CUOTA',
  PagoReserva = 'PAGO_RESERVA',
  Ute = 'UTE',
  Antel = 'ANTEL',
  Barraca = 'BARRACA',
}

export const CONCEPTO_LABEL: Record<Concepto, string> = {
  [Concepto.PagoCuota]: 'Pago de cuota',
  [Concepto.PagoReserva]: 'Pago de reserva',
  [Concepto.Ute]: 'UTE',
  [Concepto.Antel]: 'ANTEL',
  [Concepto.Barraca]: 'Barraca',
};

export interface FinanzaRespuestaDto {
  id: number;
  concepto: Concepto;
  fecha: string;
  importe: number;
  descripcion?: string | null;
  tipoMovimiento: TipoMovimiento;
}

export interface FinanzaRow extends Record<string, unknown> {
  id: number;
  concepto: Concepto;
  fecha: string;
  importeSignado: number;
  descripcion?: string | null;
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
