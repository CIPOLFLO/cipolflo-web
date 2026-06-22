import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { FileDownloadService } from '../../../core/services/file-download.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  ClienteDetalleRespuestaDto,
  ClienteRespuestaDto,
  ModificacionParticularRequestDto,
  ModificacionSocioRequestDto,
  RegistroSocioRequestDto,
} from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClientesService extends BaseHttpService {
  private readonly fileDownloadService = inject(FileDownloadService);

  getAll({
    page,
    size,
    filters,
    sortField,
    sortOrder,
  }: TableQueryParams): Observable<PageResponse<ClienteRespuestaDto>> {
    return this.get<PageResponse<ClienteRespuestaDto>>('clientes', {
      page,
      size,
      ...filters,
      sortField,
      sortOrder: sortField ? sortOrder?.toUpperCase() : undefined,
    });
  }
  getById(id: number): Observable<ClienteDetalleRespuestaDto> {
    return this.get<ClienteDetalleRespuestaDto>(`clientes/${id}`);
  }

  // TODO: reemplazar cuando el backend esté disponible
  getCostoCuota(): number {
    return 5000;
  }

  modificarParticular(
    id: number,
    dto: ModificacionParticularRequestDto,
  ): Observable<ClienteDetalleRespuestaDto> {
    return this.put<ClienteDetalleRespuestaDto>(`clientes/particulares/${id}`, dto);
  }

  modificarSocio(
    id: number,
    dto: ModificacionSocioRequestDto,
  ): Observable<ClienteDetalleRespuestaDto> {
    return this.put<ClienteDetalleRespuestaDto>(`clientes/socios/${id}`, dto);
  }

  darDeBaja(id: number): Observable<void> {
    return this.patch<void>(`clientes/socios/${id}/baja`, {});
  }

  registrarSocio(dto: RegistroSocioRequestDto): Observable<ClienteDetalleRespuestaDto> {
    return this.post<ClienteDetalleRespuestaDto>('clientes/socios', dto);
  }

  exportar(filters: Record<string, string | null>): Observable<void> {
  return this.postBlob('clientes/exportar', filters).pipe(
    map((response) => {
      this.fileDownloadService.download(response, 'clientes.xlsx');
    }),
  );
}
}
