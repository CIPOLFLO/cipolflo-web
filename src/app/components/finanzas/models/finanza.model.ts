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
  PagoCuota = 'PAGO_CUOTA',
  Ute = 'UTE',
  Ose = 'OSE',
  Antel = 'ANTEL',
  Sueldos = 'SUELDOS',
  Barraca = 'BARRACA',
  Otro = 'Otro'
}

export const CONCEPTO_LABEL: Record<Concepto, string> = {
  [Concepto.PagoReserva]: 'Pago de reserva',
  [Concepto.PagoCuota]: 'Pago de cuota',
  [Concepto.Ute]: 'UTE',
  [Concepto.Ose]: 'OSE',
  [Concepto.Antel]: 'ANTEL',
  [Concepto.Sueldos]: 'Sueldos',
  [Concepto.Barraca]: 'Barraca',
   [Concepto.Otro]: 'Otro',
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
  Debito = 'DEBITO',
  Credito = 'CREDITO',
}

export const FORMA_PAGO_OPTIONS: FormFieldOption[] = [
  { label: 'Efectivo', value: FormaPago.Efectivo },
  { label: 'Transferencia', value: FormaPago.Transferencia },
  { label: 'Debito', value: FormaPago.Debito },
];

export const TIPO_MOVIMIENTO_FORM_OPTIONS: FormFieldOption[] = [
  { label: 'Ingreso', value: TipoMovimiento.Ingreso },
  { label: 'Egreso', value: TipoMovimiento.Egreso },
];

export const CONCEPTOS_INGRESO = [
  Concepto.PagoReserva,
  Concepto.Otro
];

export const CONCEPTOS_EGRESO = [
  Concepto.Ute,
  Concepto.Antel,
  Concepto.Ose,
  Concepto.Barraca,
  Concepto.Otro,
];

export function getConceptoOptionsByTipoMovimiento(
  tipoMovimiento: TipoMovimiento | null | undefined,
): FormFieldOption[] {
  const conceptos =
    tipoMovimiento === TipoMovimiento.Ingreso
      ? CONCEPTOS_INGRESO
      : tipoMovimiento === TipoMovimiento.Egreso
        ? CONCEPTOS_EGRESO
        : Object.values(Concepto);

  return conceptos.map((concepto) => ({
    label: CONCEPTO_LABEL[concepto],
    value: concepto,
  }));
}


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
