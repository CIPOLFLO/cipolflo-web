export const MODALIDAD_PRECIO_LABEL: Record<string, string> = {
  POR_DIA: 'p/día',
  POR_PERSONA: 'p/persona',
  POR_DIA_POR_PERSONA: 'p/día p/persona',
  POR_UNIDAD: 'p/unidad',
  POR_HORA: 'p/hora',
};

export enum EstadoServicio {
  Habilitado = 'HABILITADO',
  Deshabilitado = 'DESHABILITADO',
}

export const ESTADO_SERVICIO_OPTIONS = [
  { label: 'Habilitado', value: EstadoServicio.Habilitado },
  { label: 'Deshabilitado', value: EstadoServicio.Deshabilitado },
];

export interface ServicioRespuestaDto {
  id: number;
  nombre: string;
  procedencia: string;
  precioParticular: number;
  precioSocio: number;
  modalidadPrecio: string;
  estado: EstadoServicio;
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
