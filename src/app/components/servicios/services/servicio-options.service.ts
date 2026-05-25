import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormFieldOption, PROCEDENCIA_OPTIONS } from '../../../shared';
import { MODALIDAD_PRECIO_OPTIONS } from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioOptionsService {
  getProcedencias(): Observable<FormFieldOption[]> {
    return of(PROCEDENCIA_OPTIONS);
  }

  getModalidades(): Observable<FormFieldOption[]> {
    return of(MODALIDAD_PRECIO_OPTIONS);
  }
}
