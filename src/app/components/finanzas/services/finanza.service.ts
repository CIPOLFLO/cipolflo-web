import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FinanzaDetalleRespuestaDto, TipoMovimiento } from '../models/finanza.model';
import { Procedencia } from '../../../shared';
import { BaseHttpService } from '../../../core/services/base-http.service';

@Injectable({
  providedIn: 'root',
})
export class FinanzaService extends BaseHttpService {
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
}
