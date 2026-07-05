import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { BlobExportService } from '../../../core/services/blob-export.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  CostoReservaRequestDto,
  CostoReservaRespuestaDto,
  ReservaActualizacionRequestDto,
  ReservaCreacionRequestDto,
  ReservaCreacionRespuestaDto,
  ReservaDetalleRespuestaDto,
  ReservaRow,
} from '../models/reserva.model';

@Injectable()
export class ReservasService extends BaseHttpService {
  private readonly blobExport = inject(BlobExportService);

  getAll({
    page,
    size,
    filters,
    sortField,
    sortOrder,
  }: TableQueryParams): Observable<PageResponse<ReservaRow>> {
    return this.get<PageResponse<ReservaRow>>('reservas', {
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
    return this.post<CostoReservaRespuestaDto>('reservas/calcular-costo', dto);
  }

  confirmarDocumentacion(id: number): Observable<void> {
    return this.patch<void>(`reservas/${id}/documentacion`, null);
  }
  exportar(filters: Record<string, string | null>): Observable<void> {
    return this.blobExport.export('reservas/exportar', filters, 'reservas.xlsx');
  }
}
