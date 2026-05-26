import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormFieldOption } from '../../../shared';
import { METODO_PAGO_OPTIONS } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteOptionsService {
  getMetodosPago(): Observable<FormFieldOption[]> {
    return of(METODO_PAGO_OPTIONS);
  }
}