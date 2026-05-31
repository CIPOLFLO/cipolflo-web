import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  ClienteCrearDto,
  ClienteDetalleRespuestaDto,
  ClienteRespuestaDto,
} from '../models/cliente.model';
import { BajaClienteDto } from '../models/baja-cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService extends BaseHttpService {
  getAll({ page, size, filters }: TableQueryParams): Observable<PageResponse<ClienteRespuestaDto>> {
    return this.get<PageResponse<ClienteRespuestaDto>>('clientes', { page, size, ...filters });
  }
  getById(id: number): Observable<ClienteDetalleRespuestaDto> {
    return this.get<ClienteDetalleRespuestaDto>(`clientes/${id}`);
  }

  // TODO: reemplazar cuando el backend esté disponible
  getCostoCuota(): number {
    return 5000;
  }
  create(dto: ClienteCrearDto): Observable<ClienteDetalleRespuestaDto> {
    return this.post<ClienteDetalleRespuestaDto>('clientes', dto);
  }
  // TODO: reemplazar cuando el backend esté disponible
  // return this.post<void>('clientes/baja', dto);
  darDeBaja(dto: BajaClienteDto): Observable<void> {
    return of(void 0);
  }
}
