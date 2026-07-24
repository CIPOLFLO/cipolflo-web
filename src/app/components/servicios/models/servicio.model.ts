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

export enum TipoClienteTarifa {
  Particular = 'PARTICULAR',
  SocioComun = 'SOCIO_COMUN',
  SocioPolicia = 'SOCIO_POLICIA',
  SocioPoliciaRetirado = 'SOCIO_POLICIA_RETIRADO',
}

export const ESTADO_SERVICIO_OPTIONS = [
  { label: 'Habilitado', value: EstadoServicio.Habilitado },
  { label: 'Deshabilitado', value: EstadoServicio.Deshabilitado },
];

export const TIPO_CLIENTE_TARIFA_OPTIONS: FormFieldOption[] = [
  { label: 'Particular', value: TipoClienteTarifa.Particular },
  { label: 'Socio Común', value: TipoClienteTarifa.SocioComun },
  { label: 'Socio Policía', value: TipoClienteTarifa.SocioPolicia },
  {
    label: 'Socio Policía Retirado',
    value: TipoClienteTarifa.SocioPoliciaRetirado,
  },
];

export const TIPO_CLIENTE_TARIFA_LABEL: Record<string, string> = {
  [TipoClienteTarifa.Particular]: 'Particular',
  [TipoClienteTarifa.SocioComun]: 'Socio Común',
  [TipoClienteTarifa.SocioPolicia]: 'Socio Policía',
  [TipoClienteTarifa.SocioPoliciaRetirado]: 'Socio Policía Retirado',
};

export interface TarifaServicioRequestDto {
  tipoCliente: TipoClienteTarifa;
  precio: number;
  modalidadPrecio: string;
  antiguedadMinima?: number | null;
  antiguedadMaxima?: number | null;
}

export interface TarifaServicioItemDto extends TarifaServicioRequestDto {
  id?: number;
}

export interface TarifaServicioResponseDto {
  id: number;
  tipoCliente: TipoClienteTarifa;
  precio: number;
  modalidadPrecio: string;
  antiguedadMinima: number | null;
  antiguedadMaxima: number | null;
}

export interface ServicioCrearDto {
  nombre: string;
  procedencia: string;
  precioParticular: number;
  precioSocio: number;
  modalidadPrecio: string;
  cantidad?: number | null;
  capacidad?: number | null;
  costoPersonaExtra?: number | null;
  tarifas: TarifaServicioRequestDto[];
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
  costoPersonaExtra?: number | null;
  tarifas: TarifaServicioItemDto[];
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
  costoPersonaExtra: number | null;
  tarifas: TarifaServicioResponseDto[];
}

export interface ServicioDetalleRespuestaDto extends AuditInfoDto {
  id: number;
  nombre: string;
  procedencia: string;
  cantidad: number | null;
  precioSocio: number;
  precioParticular: number;
  capacidad: number | null;
  costoPersonaExtra: number | null;
  estado: EstadoServicio;
  modalidadPrecio: string;
  tarifas: TarifaServicioResponseDto[];
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

export interface TarifaServicioRow {
  id: number;
  tipoCliente: string;
  precio: number;
  modalidad: string;
  antiguedad: string;
}
