import { ClienteRespuestaDto } from '../models/cliente.model';

/** Fila del listado con el documento a mostrar resuelto (RUT para Empresas, cédula para el resto). */
export interface ClienteListadoRow extends ClienteRespuestaDto {
  documento: string | null;
}

export function mapClienteListadoRow(cliente: ClienteRespuestaDto): ClienteListadoRow {
  return { ...cliente, documento: cliente.rut ?? cliente.cedula };
}
