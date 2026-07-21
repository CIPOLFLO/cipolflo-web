import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { BlobExportService } from '../../../core/services/blob-export.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  ClienteDetalleRespuestaDto,
  ClienteRespuestaDto,
  EstadoSocioDto,
  ModificacionParticularRequestDto,
  ModificacionSocioRequestDto,
  RegistroEmpresaRequestDto,
  RegistroSocioRequestDto,
} from '../models/cliente.model';
import { PagoCuotaResponseDto, RegistroPagoCuotaRequestDto } from '../models/pago-cuota.model';
import { BusquedaRutResponseDto } from '../../reservas/models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ClientesService extends BaseHttpService {
  private readonly blobExport = inject(BlobExportService);

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

  getByCedula(cedula: string): Observable<PageResponse<ClienteRespuestaDto>> {
    return this.get<PageResponse<ClienteRespuestaDto>>('clientes', {
      size: 1,
      identificador: cedula,
    });
  }

  /** Busca un cliente Empresa por RUT. El backend responde 404 si no existe. */
  getByRut(rut: string): Observable<BusquedaRutResponseDto> {
    return this.get<BusquedaRutResponseDto>(`clientes/rut/${rut}`);
  }

  /** Estado puntual de un socio (ACTIVO / INACTIVO / DE_BAJA), de sólo lectura. */
  getEstadoSocio(id: number): Observable<EstadoSocioDto> {
    return this.get<EstadoSocioDto>(`clientes/socios/${id}/estado`);
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
  registrarEmpresa(dto: RegistroEmpresaRequestDto): Observable<ClienteDetalleRespuestaDto> {
    return this.post<ClienteDetalleRespuestaDto>('clientes/empresas', dto);
  }
  registrarPagoCuota(
    id: number,
    dto: RegistroPagoCuotaRequestDto,
  ): Observable<PagoCuotaResponseDto[]> {
    return this.post<PagoCuotaResponseDto[]>(`clientes/socios/${id}/pago-cuota`, dto);
  }
  exportar(filters: Record<string, string | null>): Observable<void> {
    return this.blobExport.export('clientes/exportar', filters, 'clientes.xlsx');
  }
}
