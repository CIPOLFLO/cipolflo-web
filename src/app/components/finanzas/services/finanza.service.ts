import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  FinanzaCrearDto,
  FinanzaDetalleRespuestaDto,
  FinanzaRespuestaDto,
  FinanzaModificarDto,
} from '../models/finanza.model';
import { FileDownloadService } from '../../../core/services/file-download.service';

@Injectable({
  providedIn: 'root',
})
export class FinanzaService extends BaseHttpService {
  getAll({
    page,
    size,
    filters,
    sortField,
    sortOrder,
  }: TableQueryParams): Observable<PageResponse<FinanzaRespuestaDto>> {
    return this.get<PageResponse<FinanzaRespuestaDto>>('finanzas', {
      page,
      size,
      ...filters,
      sortField,
      sortOrder: sortField ? sortOrder?.toUpperCase() : undefined,
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

  private readonly fileDownloadService = inject(FileDownloadService);

  exportar(filters: Record<string, string | null>): Observable<void> {
    return this.postBlob('finanzas/export', filters).pipe(
      map((response) => {
        this.fileDownloadService.download(response, 'finanzas.xlsx');
      }),
    );
  }
}
