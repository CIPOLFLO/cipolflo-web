import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  FinanzaCrearDto,
  FinanzaDetalleRespuestaDto,
  FinanzaRespuestaDto,
  FinanzaModificarDto,
} from '../models/finanza.model';

@Injectable({
  providedIn: 'root',
})
export class FinanzaService extends BaseHttpService {
  getAll({ page, size }: TableQueryParams): Observable<PageResponse<FinanzaRespuestaDto>> {
  return of({
    content: [],
    page,
    size,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
}
  

  create(dto: FinanzaCrearDto): Observable<FinanzaRespuestaDto> {
    return this.post<FinanzaRespuestaDto>('finanzas', dto);
  }

  getById(id: number): Observable<FinanzaDetalleRespuestaDto> {
    return this.get<FinanzaDetalleRespuestaDto>(`finanzas/${id}`);
  }

  eliminar(id: number): Observable<void> {
    return this.delete<void>(`finanzas/${id}`);
  }

  update(id: number, dto: FinanzaModificarDto): Observable<void> {
    return this.put<void>(`finanzas/${id}`, dto);
  }
}