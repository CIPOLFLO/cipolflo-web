import { AuditInfoDto } from '../../../shared';

export enum EstadoCliente {
  Activo = 'ACTIVO',
  Inactivo = 'INACTIVO',
  Baja = 'BAJA',
}

export enum TipoCliente {
  Socio = 'SOCIO',
  Particular = 'PARTICULAR',
}
export enum MetodoPago {
  Cobradora = 'COBRADORA',
  Caja = 'CAJA',
  Transferencia = 'TRANSFERENCIA',
  Efectivo = 'EFECTIVO',
  DebitoAutomatico = 'DEBITO_AUTOMATICO',
}

export const METODO_PAGO_OPTIONS = [
  { label: 'Cobradora', value: MetodoPago.Cobradora },
  { label: 'Caja', value: MetodoPago.Caja },
  { label: 'Transferencia', value: MetodoPago.Transferencia },
  { label: 'Efectivo', value: MetodoPago.Efectivo },
  { label: 'Débito automático', value: MetodoPago.DebitoAutomatico },
];

export const ESTADO_CLIENTE_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Activo', value: EstadoCliente.Activo },
  { label: 'Inactivo', value: EstadoCliente.Inactivo },
  { label: 'De baja', value: EstadoCliente.Baja },
];

export const TIPO_CLIENTE_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Socio', value: TipoCliente.Socio },
  { label: 'Particular', value: TipoCliente.Particular },
];

export interface ClienteRespuestaDto extends Record<string, unknown> {
  id: number;
  nombre: string;
  tipoCliente: TipoCliente;
  numeroSocio: string;
  cedula: string;
  email: string;
  estado: EstadoCliente;
}

export interface ClienteDetalleRespuestaDto extends AuditInfoDto {
  id: number;
  nombre: string;
  tipoCliente: TipoCliente;
  numeroSocio: string;
  cedula: string;
  email: string;
  estado: EstadoCliente;
  fechaNacimiento: string;
  telefono: string;
  metodoPago: MetodoPago;
  pais: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  observaciones: string;
}
export interface ClienteCrearDto {
  tipoCliente: TipoCliente;
  nombre: string;
  cedula: string;
  fechaNacimiento: string;
  telefono: string;
  email: string | null;
  metodoPago: MetodoPago;
  pais: string;
  departamento: string;
  ciudad: string;
  direccion: string | null;
  observaciones: string | null;
}
