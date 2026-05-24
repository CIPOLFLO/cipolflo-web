import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  ServicioActualizarDto,
  ServicioCrearDto,
  ServicioDetalleRespuestaDto,
  ServicioRespuestaDto,
} from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioService extends BaseHttpService {
  getAll({
    page,
    size,
    filters,
  }: TableQueryParams): Observable<PageResponse<ServicioRespuestaDto>> {
    return this.get<PageResponse<ServicioRespuestaDto>>('servicios', { page, size, ...filters });
  }

  getById(id: number): Observable<ServicioDetalleRespuestaDto> {
    return this.get<ServicioDetalleRespuestaDto>(`servicios/${id}`);
  }

  create(dto: ServicioCrearDto): Observable<ServicioRespuestaDto> {
    return this.post<ServicioRespuestaDto>('servicios', dto);
  }

  update(id: number, dto: ServicioActualizarDto): Observable<ServicioRespuestaDto> {
    return this.put<ServicioRespuestaDto>(`servicios/${id}`, dto);
  }
}
