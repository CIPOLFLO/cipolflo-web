import { PageResponse } from '../../../shared';
import { ServicioRespuestaDto } from '../../servicios/models/servicio.model';

/**
 * Mapea la respuesta paginada de servicios al listado plano que consume el form de
 * reserva (selector de servicios). El form pide los habilitados de una procedencia con
 * un tamaño de página amplio, así que sólo necesita el contenido de la página.
 */
export function mapServiciosReserva(
  page: PageResponse<ServicioRespuestaDto>,
): ServicioRespuestaDto[] {
  return page.content;
}
