import { AuditInfoDto } from '../../../shared';

export enum EstadoSocio {
  Activo = 'ACTIVO',
  Inactivo = 'INACTIVO',
  Baja = 'DE_BAJA',
}

export enum TipoCliente {
  Socio = 'SOCIO',
  Particular = 'PARTICULAR',
}

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
  numeroSocio: string;
  cedula: string;
  email: string;
  estado: EstadoSocio;
  fechaNacimiento: string;
  telefono: string;
  metodoPago: string;
  pais: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  observaciones: string;
}
