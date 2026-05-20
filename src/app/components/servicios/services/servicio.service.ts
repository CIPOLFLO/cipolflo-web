import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import { ServicioRespuestaDto } from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioService extends BaseHttpService {
  getAll({
    page,
    size,
    filters,
  }: TableQueryParams): Observable<PageResponse<ServicioRespuestaDto>> {
    return this.get<PageResponse<ServicioRespuestaDto>>('servicios', { page, size, ...filters });
  }
}
