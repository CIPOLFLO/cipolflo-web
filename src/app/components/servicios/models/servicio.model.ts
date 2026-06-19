import { type AuditInfoDto, type FormFieldOption, EstadoReserva } from '../../../shared';

export const MODALIDAD_PRECIO_OPTIONS: FormFieldOption[] = [
  { label: 'Por día', value: 'POR_DIA' },
  { label: 'Por persona', value: 'POR_PERSONA' },
  { label: 'Por día por persona', value: 'POR_DIA_POR_PERSONA' },
  { label: 'Por unidad', value: 'POR_UNIDAD' },
  { label: 'Por hora', value: 'POR_HORA' },
];

export const MODALIDAD_PRECIO_LABEL: Record<string, string> = {
  POR_DIA: 'p/día',
  POR_PERSONA: 'p/persona',
  POR_DIA_POR_PERSONA: 'p/día p/persona',
  POR_UNIDAD: 'p/unidad',
  POR_HORA: 'p/hora',
};

export const MODALIDAD_PRECIO_DETALLE_LABEL: Record<string, string> = {
  POR_DIA: 'Por día',
  POR_PERSONA: 'Por persona',
  POR_DIA_POR_PERSONA: 'Por día por persona',
  POR_UNIDAD: 'Por unidad',
  POR_HORA: 'Por hora',
};

export enum EstadoServicio {
  Habilitado = 'HABILITADO',
  Deshabilitado = 'DESHABILITADO',
}

export const ESTADO_SERVICIO_OPTIONS = [
  { label: 'Habilitado', value: EstadoServicio.Habilitado },
  { label: 'Deshabilitado', value: EstadoServicio.Deshabilitado },
];

export interface ServicioCrearDto {
  nombre: string;
  procedencia: string;
  precioParticular: number;
  precioSocio: number;
  modalidadPrecio: string;
  cantidad?: number | null;
  capacidad?: number | null;
}

export interface ServicioActualizarDto {
  nombre: string;
  procedencia: string;
  estado: EstadoServicio;
  precioParticular: number;
  precioSocio: number;
  modalidadPrecio: string;
  cantidad?: number | null;
  capacidad?: number | null;
}

export interface ServicioRespuestaDto {
  id: number;
  nombre: string;
  procedencia: string;
  precioParticular: number;
  precioSocio: number;
  modalidadPrecio: string;
  estado: EstadoServicio;
  capacidad: number | null;
  cantidad: number | null;
}

export interface ServicioDetalleRespuestaDto extends AuditInfoDto {
  id: number;
  nombre: string;
  procedencia: string;
  cantidad: number | null;
  precioSocio: number;
  precioParticular: number;
  capacidad: number | null;
  estado: EstadoServicio;
  modalidadPrecio: string;
}

export interface ReservaProximaDto {
  id: number;
  clienteId: number;
  nombreCliente?: string;
  fechaEntrada: string;
  fechaSalida: string;
  pago: boolean;
  estado: EstadoReserva;
}

/** Rango de fechas ocupado por una reserva activa del servicio (alimenta el calendario). */
export interface ServicioFechaOcupadaDto {
  reservaId: number;
  estado: EstadoReserva;
  fechaInicio: string;
  fechaFin: string;
}

export interface HabilitacionServicioDto {
  habilitado: boolean;
  reservasACancelar?: number[];
  confirmarDevolucion?: boolean;
}

export interface ServicioRow extends Record<string, unknown> {
  id: number;
  nombre: string;
  procedencia: string;
  precioParticular: number;
  precioSocio: number;
  unidad: string;
  estado: EstadoServicio;
}
