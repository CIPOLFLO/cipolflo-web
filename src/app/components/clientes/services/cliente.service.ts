import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  ClienteDetalleRespuestaDto,
  ClienteRespuestaDto,
  EstadoSocioDto,
  ModificacionParticularRequestDto,
  ModificacionSocioRequestDto,
  RegistroSocioRequestDto,
} from '../models/cliente.model';
import { PagoCuotaResponseDto, RegistroPagoCuotaRequestDto } from '../models/pago-cuota.model';
@Injectable({ providedIn: 'root' })
export class ClientesService extends BaseHttpService {
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

  /** Estado puntual de un socio (ACTIVO / INACTIVO / DE_BAJA), de sólo lectura. */
  getEstadoSocio(id: number): Observable<EstadoSocioDto> {
    return this.get<EstadoSocioDto>(`clientes/socios/${id}/estado`);
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

  registrarPagoCuota(
    socioId: number,
    dto: RegistroPagoCuotaRequestDto,
  ): Observable<PagoCuotaResponseDto[]> {
    return this.post<PagoCuotaResponseDto[]>(`clientes/socios/${socioId}/pago-cuota`, dto);
  }
}
