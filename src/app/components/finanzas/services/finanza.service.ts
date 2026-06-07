import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams, Procedencia } from '../../../shared';
import {
  Concepto,
  FinanzaCrearDto,
  FinanzaDetalleRespuestaDto,
  FinanzaRespuestaDto,
  TipoMovimiento,
} from '../models/finanza.model';

@Injectable({
  providedIn: 'root',
})
export class FinanzaService extends BaseHttpService {
  getAll({ page, size }: TableQueryParams): Observable<PageResponse<FinanzaRespuestaDto>> {
    // TODO: reemplazar cuando el backend esté disponible
    // return this.get<PageResponse<FinanzaRespuestaDto>>('finanzas', { page, size, ...filters, sortField, sortOrder: sortField ? sortOrder?.toUpperCase() : undefined });
    return of({
      content: [
        {
          id: 1,
          concepto: Concepto.PagoReserva,
          fecha: '14/3/2026',
          importe: 15000,
          descripcion: 'Cuota marzo 2026 - Socio 0042',
          tipoMovimiento: TipoMovimiento.Ingreso,
        },
        {
          id: 2,
          concepto: Concepto.PagoReserva,
          fecha: '15/3/2026',
          importe: 5000,
          descripcion: 'Reserva parrillero 22/3/2026',
          tipoMovimiento: TipoMovimiento.Ingreso,
        },
        {
          id: 3,
          concepto: Concepto.Ute,
          fecha: '16/3/2026',
          importe: 8500,
          descripcion: null,
          tipoMovimiento: TipoMovimiento.Egreso,
        },
      ],
      page,
      size,
      totalElements: 3,
      totalPages: 1,
      first: true,
      last: true,
    });
  }

  create(dto: FinanzaCrearDto): Observable<void> {
    // TODO: reemplazar cuando el backend esté disponible
    // return this.post<void>('finanzas', dto);
    console.log('[FinanzaService] create:', dto);
    return of(undefined);
  }

  getById(id: number): Observable<FinanzaDetalleRespuestaDto> {
    // TODO: reemplazar cuando el backend esté disponible
    return of({
      id,
      codigo: 'FIN-2026-001',
      procedencia: Procedencia.Camping,
      servicio: 'Alquiler de parrillero',
      fecha: '14/3/2026',
      importe: 15000,
      formaPago: 'Transferencia',
      notas:
        'Pago de cuota mensual correspondiente a Marzo 2026. Socio al día con sus obligaciones.',
      createdAt: '2026-03-15T14:30:00Z',
      createdBy: 'Juan Pérez',
      updatedAt: '2026-03-15T14:30:00Z',
      updatedBy: 'Juan Pérez',
      tipoMovimiento: TipoMovimiento.Ingreso,
    });
  }

  eliminar(id: number): Observable<void> {
    // TODO: reemplazar cuando el backend esté disponible
    console.log('Eliminar finanza', id);
    return of(void 0);
  }
}
