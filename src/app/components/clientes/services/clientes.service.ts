import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import { ClienteDetalleRespuestaDto, ClienteRespuestaDto } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService extends BaseHttpService {
  getAll({ page, size, filters }: TableQueryParams): Observable<PageResponse<ClienteRespuestaDto>> {
    return this.get<PageResponse<ClienteRespuestaDto>>('clientes', { page, size, ...filters });
  }

  getById(id: number): Observable<ClienteDetalleRespuestaDto | undefined> {
    // TODO: reemplazar cuando el endpoint de detalle esté disponible
    console.log('id', id);
    return of(undefined);
  }
}
