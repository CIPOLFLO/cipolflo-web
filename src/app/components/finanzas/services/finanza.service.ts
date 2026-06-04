import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FinanzaDetalleRespuestaDto, TipoMovimiento } from '../models/finanza.model';
import { Procedencia } from '../../../shared';

@Injectable({
  providedIn: 'root',
})
export class FinanzaService {
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
