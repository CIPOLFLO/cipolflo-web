import { AuditInfoDto } from '../../../shared/models/audit.model';

export enum EstadoCliente {
  Activo = 'ACTIVO',
  Inactivo = 'INACTIVO',
  Baja = 'BAJA',
}

export enum TipoCliente {
  Socio = 'SOCIO',
  Particular = 'PARTICULAR',
}

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
  metodoPago: string;
  pais: string;
  departamento: string;
  ciudad: string;
  direccion: string;
  observaciones: string;
}
