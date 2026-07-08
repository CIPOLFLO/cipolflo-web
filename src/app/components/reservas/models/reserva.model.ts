import {
  type AuditInfoDto,
  type FormFieldOption,
  EstadoReserva,
  Procedencia,
} from '../../../shared';
import { FormaPago } from '../../../shared/models/forma-pago.model';
import { EstadoSocio, TipoCliente } from '../../clientes/models/cliente.model';

export interface ReservaRow extends Record<string, unknown> {
  id: number;
  clienteId: number;
  nombreCliente: string;
  servicioId: number;
  servicioNombre: string;
  fechaEntrada: string;
  fechaSalida: string;
  estadoReserva: EstadoReserva;
  requiereDocumentacion: boolean;
  tieneDocumentacion: boolean;
  tipoReserva: TipoReserva;
  montoImpago: number;
  fechaLimitePago: string | null;
  pago: boolean;
  pendienteDocumentacion: boolean;
}

export enum TipoReserva {
  Comun = 'COMUN',
  ColaboracionSinFines = 'COLABORACION_SIN_FINES_DE_LUCRO',
}

export const TIPO_RESERVA_LABEL: Record<TipoReserva, string> = {
  [TipoReserva.Comun]: 'Común',
  [TipoReserva.ColaboracionSinFines]: 'Colaboración sin fines de lucro',
};

export const FORMA_PAGO_RESERVA_LABEL: Partial<Record<FormaPago, string>> = {
  [FormaPago.Efectivo]: 'Efectivo',
  [FormaPago.Transferencia]: 'Transferencia',
};

export const TIPO_CLIENTE_LABEL: Record<TipoCliente, string> = {
  [TipoCliente.Socio]: 'Socio',
  [TipoCliente.Particular]: 'Particular',
};

export const TIPO_RESERVA_OPTIONS: FormFieldOption[] = [
  { label: 'Común', value: TipoReserva.Comun },
  { label: 'Colaboración sin fines de lucro', value: TipoReserva.ColaboracionSinFines },
];

/**
 * Estado inicial de la reserva según su tipo y sus requisitos previos:
 * - `COLABORACION_SIN_FINES_DE_LUCRO`: siempre `CONFIRMADA` (ignora documentación y seña).
 * - `COMUN`: `CONFIRMADA` solo si no requiere documentación ni seña; en caso contrario `PENDIENTE`.
 *
 * El estado autoritativo lo asigna el backend al crear la reserva; este helper solo refleja
 * esa misma regla para usos en el front.
 */
export function estadoInicialPorTipo(
  tipo: TipoReserva,
  requiereDocumentacion = false,
  requiereSena = false,
): EstadoReserva {
  if (tipo !== TipoReserva.Comun) return EstadoReserva.Confirmada;
  return requiereDocumentacion || requiereSena ? EstadoReserva.Pendiente : EstadoReserva.Confirmada;
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
  requiereDocumentacion: boolean;
  requiereSena: boolean;
}

export interface ReservaCreacionRespuestaDto {
  id: number;
}

export interface ReservaActualizacionRequestDto {
  procedencia: Procedencia;
  servicioId: number;
  fechaInicio: string;
  fechaFin: string;
  cantidadTotal: number | null;
  cantidadMenores: number | null;
  cantidad: number | null;
  notas: string | null;
}

/** Parámetros para calcular el costo de una reserva (depende del servicio y las cantidades). */
export interface CostoReservaRequestDto {
  servicioId: number;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string | null;
  horaFin: string | null;
  cantidadTotal: number | null;
  cantidadMenores: number | null;
  cantidad: number | null;
  tipoCliente: TipoCliente | null;
}

export interface CostoReservaRespuestaDto {
  costoTotal: number;
}

export interface ClienteDetalleReservaDto {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string | null;
  email: string | null;
  tipoCliente: TipoCliente;
}

export interface ServicioDetalleReservaDto {
  id: number;
  nombre: string;
  procedencia: Procedencia;
  modalidadPrecio: string;
}

export interface ReservaDetalleRespuestaDto extends AuditInfoDto {
  id: number;
  tipoReserva: TipoReserva;
  estado: EstadoReserva;
  procedencia: Procedencia;
  fechaEntrada: string;
  fechaSalida: string;
  horaInicio: string | null;
  horaFin: string | null;
  cantidadTotal: number | null;
  cantidadMenores: number | null;
  cantidad: number | null;
  importe: number | null;
  montoImpago: number | null;
  formaPago: FormaPago | null;
  pago: boolean;
  requiereDocumentacion: boolean;
  tieneDocumentacion: boolean;
  requiereSena: boolean;
  nombre: string | null;
  rut: string | null;
  notas: string | null;
  cliente: ClienteDetalleReservaDto | null;
  servicio: ServicioDetalleReservaDto;
}

export type ReservaRespuestaDto = ReservaRow;

export interface RegistroPagoReservaRequestDto {
  importe: number;
  esPagoTotal: boolean;
  formaPago: FormaPago;
  notas: string | null;
}

export interface PagoAsociadoReservaDto {
  id: number;
  fecha: string;
  importe: number;
  formaPago: FormaPago;
}

export interface ReservaCancelacionCheckResponseDto {
  puedeCancelarseDirectamente: boolean;
  pagosAsociados: PagoAsociadoReservaDto[];
  importeTotalPagos: number;
}

export interface ReservaCancelacionRequestDto {
  generarDevolucion: boolean;
  formaPago?: FormaPago;
  importeDevolucion?: number;
}

export interface ReservaFinalizacionCheckResponseDto {
  puedeFinalizarseDirectamente: boolean;
  montoImpago: number;
}

export interface ReservaFinalizacionRequestDto {
  completarPago?: boolean;
  formaPago?: FormaPago;
  notas?: string;
}

