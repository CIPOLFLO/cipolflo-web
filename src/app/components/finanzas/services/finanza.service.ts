import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { PageResponse, TableQueryParams } from '../../../shared';
import {
  Concepto,
  FinanzaDetalleRespuestaDto,
  FinanzaRespuestaDto,
  TipoMovimiento,
} from '../models/finanza.model';
import { Procedencia } from '../../../shared';

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
          concepto: Concepto.PagoCuota,
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

  getById(id: number): Observable<FinanzaDetalleRespuestaDto> {
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
      fechaRegistro: '15 mar 2026, 14:30',
      registradoPor: 'Juan Pérez',
      tipoMovimiento: TipoMovimiento.Ingreso,
    });
  }
}
