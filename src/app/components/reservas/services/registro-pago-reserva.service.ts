import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { RegistroPagoReservaRequestDto } from '../models/reserva.model';

@Injectable({
  providedIn: 'root',
})
export class RegistroPagoReservaService extends BaseHttpService {
  registrarPago(reservaId: number, dto: RegistroPagoReservaRequestDto): Observable<void> {
    return this.post<void>(`pago_reserva/${reservaId}`, dto);
  }
}