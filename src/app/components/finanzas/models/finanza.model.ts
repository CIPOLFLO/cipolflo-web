import { type FormFieldOption, Procedencia } from '../../../shared';
import { type AuditInfoDto } from '../../../shared';

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
  PagoReserva = 'PAGO_RESERVA',
  Ute = 'UTE',
  Antel = 'ANTEL',
  Barraca = 'BARRACA',
}

export const CONCEPTO_LABEL: Record<Concepto, string> = {
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

export enum FormaPago {
  Efectivo = 'EFECTIVO',
  Transferencia = 'TRANSFERENCIA',
}

export const FORMA_PAGO_OPTIONS: FormFieldOption[] = [
  { label: 'Efectivo', value: FormaPago.Efectivo },
  { label: 'Transferencia', value: FormaPago.Transferencia },
];

export const TIPO_MOVIMIENTO_FORM_OPTIONS: FormFieldOption[] = [
  { label: 'Ingreso', value: TipoMovimiento.Ingreso },
  { label: 'Egreso', value: TipoMovimiento.Egreso },
];

export const CONCEPTO_OPTIONS: FormFieldOption[] = (
  Object.entries(CONCEPTO_LABEL) as [Concepto, string][]
).map(([value, label]) => ({ label, value }));

export interface FinanzaCrearDto {
  tipoMovimiento: TipoMovimiento;
  procedencia: Procedencia;
  concepto: Concepto;
  fecha: string;
  importe: number;
  formaPago: FormaPago;
  notas?: string | null;
}

export interface FinanzaDetalleRespuestaDto extends AuditInfoDto {
  id: number;
  codigo: string;
  procedencia: Procedencia;
  concepto: Concepto;
  fecha: string;
  importe: number;
  formaPago: string;
  notas?: string | null;
  tipoMovimiento: TipoMovimiento;
}

export interface FinanzaModificarDto {
  procedencia: Procedencia;
  concepto: Concepto;
  fecha: string;
  importe: number;
  formaPago: FormaPago;
  notas?: string | null;
}
