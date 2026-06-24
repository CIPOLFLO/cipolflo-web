import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  HabilitacionServicioDto,
  ReservaProximaDto,
  ServicioActualizarDto,
  ServicioCrearDto,
  ServicioDetalleRespuestaDto,
  ServicioFechaOcupadaDto,
  ServicioRespuestaDto,
} from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioService extends BaseHttpService {
  getAll({
    page,
    size,
    filters,
    sortField,
    sortOrder,
  }: TableQueryParams): Observable<PageResponse<ServicioRespuestaDto>> {
    return this.get<PageResponse<ServicioRespuestaDto>>('servicios', {
      page,
      size,
      ...filters,
      sortField,
      sortOrder: sortField ? sortOrder?.toUpperCase() : undefined,
    });
  }

  getById(id: number): Observable<ServicioDetalleRespuestaDto> {
    return this.get<ServicioDetalleRespuestaDto>(`servicios/${id}`);
  }

  /** Rangos de fecha ocupados de un servicio dentro de la ventana [desde, hasta]. */
  getFechasOcupadas(
    id: number,
    desde: string,
    hasta: string,
  ): Observable<ServicioFechaOcupadaDto[]> {
    return this.get<ServicioFechaOcupadaDto[]>(`servicios/${id}/fechas-ocupadas`, { desde, hasta });
  }

  create(dto: ServicioCrearDto): Observable<ServicioDetalleRespuestaDto> {
    return this.post<ServicioDetalleRespuestaDto>('servicios', dto);
  }

  update(id: number, dto: ServicioActualizarDto): Observable<ServicioDetalleRespuestaDto> {
    return this.put<ServicioDetalleRespuestaDto>(`servicios/${id}`, dto);
  }

  getReservasProximas(id: number): Observable<ReservaProximaDto[]> {
    return this.get<ReservaProximaDto[]>(`servicios/${id}/reservas-proximas`);
  }

  actualizarHabilitacion(
    id: number,
    dto: HabilitacionServicioDto,
  ): Observable<ServicioDetalleRespuestaDto> {
    return this.patch<ServicioDetalleRespuestaDto>(`servicios/${id}/habilitacion`, dto);
  }
}
