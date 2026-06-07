import { AuditInfoDto, FormFieldOption } from '../../../shared';

export enum EstadoSocio {
  Activo = 'ACTIVO',
  Inactivo = 'INACTIVO',
  Baja = 'DE_BAJA',
}

export enum TipoCliente {
  Socio = 'SOCIO',
  Particular = 'PARTICULAR',
}
export enum MetodoCobro {
  Cobradora = 'COBRADORA',
  DescuentoSalarial = 'DESCUENTO_SALARIAL',
  Transferencia = 'TRANSFERENCIA',
  EnSede = 'EN_SEDE',
  Efectivo = 'EFECTIVO',
}

export const METODO_COBRO_OPTIONS: FormFieldOption[] = [
  { label: 'Cobradora', value: MetodoCobro.Cobradora },
  { label: 'Descuento salarial', value: MetodoCobro.DescuentoSalarial },
  { label: 'Transferencia', value: MetodoCobro.Transferencia },
  { label: 'En sede', value: MetodoCobro.EnSede },
  { label: 'Efectivo', value: MetodoCobro.Efectivo },
];

export const METODO_COBRO_LABEL: Record<MetodoCobro, string> = {
  [MetodoCobro.Cobradora]: 'Cobradora',
  [MetodoCobro.DescuentoSalarial]: 'Descuento salarial',
  [MetodoCobro.Transferencia]: 'Transferencia',
  [MetodoCobro.EnSede]: 'En sede',
  [MetodoCobro.Efectivo]: 'Efectivo',
};

export const ESTADO_SOCIO_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Activo', value: EstadoSocio.Activo },
  { label: 'Inactivo', value: EstadoSocio.Inactivo },
  { label: 'De baja', value: EstadoSocio.Baja },
];

export const TIPO_CLIENTE_OPTIONS = [
  { label: 'Todos', value: '' },
  { label: 'Socio', value: TipoCliente.Socio },
  { label: 'Particular', value: TipoCliente.Particular },
];

export interface ListadoClientesRequestDto {
  tipoCliente?: TipoCliente;
  nombre?: string;
  identificador?: string;
  estado?: EstadoSocio;
}

export interface ClienteRespuestaDto extends Record<string, unknown> {
  id: number;
  nombreCompleto: string;
  cedula: string;
  email: string | null;
  tipoCliente: TipoCliente;
  numeroSocio: number | null;
  estado: EstadoSocio | null;
}

export interface ClienteDetalleRespuestaDto extends AuditInfoDto {
  id: number;
  nombre: string;
  tipoCliente: TipoCliente;
  numeroSocio: number | null;
  cedula: string;
  email: string | null;
  estado: EstadoSocio | null;
  fechaNacimiento: string | null;
  telefono: string;
  metodoCobro: MetodoCobro | null;
  pais: string | null;
  departamento: string | null;
  ciudad: string | null;
  direccion: string | null;
  observaciones: string | null;
}
export interface ModificacionParticularRequestDto {
  nombreCompleto: string;
  telefono: string;
  mail: string | null;
  notas: string | null;
}

export interface ModificacionSocioRequestDto {
  cedula: string;
  nombreCompleto: string;
  telefono: string;
  mail: string | null;
  notas: string | null;
  fechaNacimiento: string;
  pais: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  metodoCobro: MetodoCobro;
}

export interface ClienteCrearDto {
  tipoCliente: TipoCliente;
  nombre: string;
  cedula: string;
  fechaNacimiento: string;
  telefono: string;
  email: string | null;
  metodoCobro: MetodoCobro;
  pais: string;
  departamento: string;
  ciudad: string;
  direccion: string | null;
  observaciones: string | null;
}

export interface RegistroSocioRequestDto {
  cedula: string;
  nombre: string;
  fechaNacimiento: string;
  telefono: string;
  email: string | null;
  metodoCobro: MetodoCobro;
  pais: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  observaciones: string | null;
}
