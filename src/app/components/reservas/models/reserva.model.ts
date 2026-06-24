import { type FormFieldOption, EstadoReserva, Procedencia } from '../../../shared';
import { EstadoSocio, TipoCliente } from '../../clientes/models/cliente.model';

export interface ReservaRow extends Record<string, unknown> {
  id: number;
  cliente: string;
  servicio: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
}

export enum TipoReserva {
  Comun = 'COMUN',
  ColaboracionSinFines = 'COLABORACION_SIN_FINES_DE_LUCRO',
}

export const TIPO_RESERVA_OPTIONS: FormFieldOption[] = [
  { label: 'Común', value: TipoReserva.Comun },
  { label: 'Colaboración sin fines de lucro', value: TipoReserva.ColaboracionSinFines },
];

/** Estado inicial según el tipo de reserva: Común → PENDIENTE; cualquier otro → CONFIRMADA. */
export function estadoInicialPorTipo(tipo: TipoReserva): EstadoReserva {
  return tipo === TipoReserva.Comun ? EstadoReserva.Pendiente : EstadoReserva.Confirmada;
}

/**
 * Datos del cliente para precargar la sección de cliente de la reserva. Representa el
 * resultado combinado de la búsqueda por cédula + el detalle (observaciones, teléfono).
 */
export interface ClienteBusquedaReservaDto {
  id: number;
  nombre: string;
  cedula: string;
  tipoCliente: TipoCliente;
  numeroSocio: number | null;
  estado: EstadoSocio | null;
  telefono: string | null;
  email: string | null;
  observaciones: string | null;
}

export interface ReservaCreacionRequestDto {
  tipoReserva: TipoReserva;
  procedencia: Procedencia;
  servicioId: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string | null;
  horaFin: string | null;
  cantidadTotal: number | null;
  cantidadMenores: number | null;
  cantidad: number | null;
  clienteId: number | null;
  crearCliente: boolean;
  tipoCliente: TipoCliente | null;
  cedula: string | null;
  nombre: string | null;
  celular: string | null;
  email: string | null;
  rut: string | null;
  notas: string | null;
}

export interface ReservaCreacionRespuestaDto {
  id: number;
}

/** Parámetros para calcular el costo de una reserva (depende del servicio y las cantidades). */
export interface CostoReservaRequestDto {
  servicioId: number;
  fechaInicio: string;
  fechaFin: string;
  cantidadTotal: number | null;
  cantidadMenores: number | null;
  cantidad: number | null;
}

export interface CostoReservaRespuestaDto {
  costo: number;
}
