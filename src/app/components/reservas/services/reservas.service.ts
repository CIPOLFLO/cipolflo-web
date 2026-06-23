import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, parseIsoDate, TableQueryParams } from '../../../shared';
import {
  CostoReservaRequestDto,
  CostoReservaRespuestaDto,
  ReservaActualizacionRequestDto,
  ReservaCreacionRequestDto,
  ReservaCreacionRespuestaDto,
  ReservaDetalleRespuestaDto,
  ReservaRespuestaDto,
} from '../models/reserva.model';

@Injectable()
export class ReservasService extends BaseHttpService {
  getAll({
    page,
    size,
    filters,
    sortField,
    sortOrder,
  }: TableQueryParams): Observable<PageResponse<ReservaRespuestaDto>> {
    return this.get<PageResponse<ReservaRespuestaDto>>('reservas', {
      page,
      size,
      ...filters,
      sortField,
      sortOrder: sortField ? sortOrder?.toUpperCase() : undefined,
    });
  }

  getById(id: number): Observable<ReservaDetalleRespuestaDto> {
    return this.get<ReservaDetalleRespuestaDto>(`reservas/${id}`);
  }

  crear(dto: ReservaCreacionRequestDto): Observable<ReservaCreacionRespuestaDto> {
    return this.post<ReservaCreacionRespuestaDto>('reservas', dto);
  }

  update(id: number, dto: ReservaActualizacionRequestDto): Observable<void> {
    return this.put<void>(`reservas/${id}`, dto);
  }

  calcularCosto(dto: CostoReservaRequestDto): Observable<CostoReservaRespuestaDto> {
    // TODO: reemplazar cuando el backend exponga el cálculo de costo (POST /reservas/costo).
    // return this.post<CostoReservaRespuestaDto>('reservas/costo', dto);
    return of({ costo: costoMock(dto) });
  }
}

/**
 * Costo provisorio en base a noches y cantidad, para que la pantalla sea dinámica
 * mientras no exista el endpoint real (que sí conoce los precios del servicio).
 */
function costoMock(dto: CostoReservaRequestDto): number {
  const TARIFA_POR_NOCHE = 1500;
  const inicio = parseIsoDate(dto.fechaInicio);
  const fin = parseIsoDate(dto.fechaFin);
  if (!inicio || !fin) return 0;
  const noches = Math.max(1, Math.round((fin.getTime() - inicio.getTime()) / 86_400_000));
  const cantidad = Math.max(1, dto.cantidad ?? dto.cantidadTotal ?? 1);
  return noches * TARIFA_POR_NOCHE * cantidad;
}
