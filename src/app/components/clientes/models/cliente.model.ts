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

export interface ClienteRow extends Record<string, unknown> {
  id: number;
  nombre: string;
  tipoCliente: TipoCliente;
  numeroSocio: string;
  cedula: string;
  email: string;
  estado: EstadoCliente;
}
