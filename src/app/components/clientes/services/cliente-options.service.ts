import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormFieldOption } from '../../../shared';
import { METODO_COBRO_OPTIONS } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteOptionsService {
  getMetodosPago(): Observable<FormFieldOption[]> {
    return of(METODO_COBRO_OPTIONS);
  }
}
