import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  DestinatarioNotificacionEmailResponseDto,
  HabilitacionDestinatarioNotificacionEmailRequestDto,
  ModificacionDestinatarioNotificacionEmailRequestDto,
  RegistroDestinatarioNotificacionEmailRequestDto,
} from '../models/ajuste.model';

@Injectable({ providedIn: 'root' })
export class DestinatarioNotificacionEmailService extends BaseHttpService {
  getAll({
    page,
    size,
    filters,
    sortField,
    sortOrder,
  }: TableQueryParams): Observable<PageResponse<DestinatarioNotificacionEmailResponseDto>> {
    return this.get<PageResponse<DestinatarioNotificacionEmailResponseDto>>(
      'ajustes/destinatarios-notificacion-email',
      {
        page,
        size,
        ...filters,
        sortField,
        sortOrder: sortField ? sortOrder?.toUpperCase() : undefined,
      },
    );
  }

  getById(id: number): Observable<DestinatarioNotificacionEmailResponseDto> {
    return this.get<DestinatarioNotificacionEmailResponseDto>(
      `ajustes/destinatarios-notificacion-email/${id}`,
    );
  }

  create(
    dto: RegistroDestinatarioNotificacionEmailRequestDto,
  ): Observable<DestinatarioNotificacionEmailResponseDto> {
    return this.post<DestinatarioNotificacionEmailResponseDto>(
      'ajustes/destinatarios-notificacion-email',
      dto,
    );
  }

  update(
    id: number,
    dto: ModificacionDestinatarioNotificacionEmailRequestDto,
  ): Observable<DestinatarioNotificacionEmailResponseDto> {
    return this.put<DestinatarioNotificacionEmailResponseDto>(
      `ajustes/destinatarios-notificacion-email/${id}`,
      dto,
    );
  }

  actualizarHabilitacion(
    id: number,
    dto: HabilitacionDestinatarioNotificacionEmailRequestDto,
  ): Observable<DestinatarioNotificacionEmailResponseDto> {
    return this.patch<DestinatarioNotificacionEmailResponseDto>(
      `ajustes/destinatarios-notificacion-email/${id}/habilitacion`,
      dto,
    );
  }

  eliminar(id: number): Observable<void> {
    return this.delete<void>(`ajustes/destinatarios-notificacion-email/${id}`);
  }
}
