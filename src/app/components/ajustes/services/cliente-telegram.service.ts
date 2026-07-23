import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  ClienteTelegramResponseDto,
  HabilitacionClienteTelegramRequestDto,
  ModificacionClienteTelegramRequestDto,
  RegistroClienteTelegramRequestDto,
} from '../models/ajuste.model';

@Injectable({ providedIn: 'root' })
export class ClienteTelegramService extends BaseHttpService {
  getAll({
    page,
    size,
    filters,
    sortField,
    sortOrder,
  }: TableQueryParams): Observable<PageResponse<ClienteTelegramResponseDto>> {
    return this.get<PageResponse<ClienteTelegramResponseDto>>('ajustes/clientes-telegram', {
      page,
      size,
      ...filters,
      sortField,
      sortOrder: sortField ? sortOrder?.toUpperCase() : undefined,
    });
  }

  getById(id: number): Observable<ClienteTelegramResponseDto> {
    return this.get<ClienteTelegramResponseDto>(`ajustes/clientes-telegram/${id}`);
  }

  create(dto: RegistroClienteTelegramRequestDto): Observable<ClienteTelegramResponseDto> {
    return this.post<ClienteTelegramResponseDto>('ajustes/clientes-telegram', dto);
  }

  update(
    id: number,
    dto: ModificacionClienteTelegramRequestDto,
  ): Observable<ClienteTelegramResponseDto> {
    return this.put<ClienteTelegramResponseDto>(`ajustes/clientes-telegram/${id}`, dto);
  }

  actualizarHabilitacion(
    id: number,
    dto: HabilitacionClienteTelegramRequestDto,
  ): Observable<ClienteTelegramResponseDto> {
    return this.patch<ClienteTelegramResponseDto>(
      `ajustes/clientes-telegram/${id}/habilitacion`,
      dto,
    );
  }

  eliminar(id: number): Observable<void> {
    return this.delete<void>(`ajustes/clientes-telegram/${id}`);
  }
}
