import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FormFieldOption, Procedencia, PROCEDENCIA_OPTIONS } from '../../../shared';
import { MODALIDAD_PRECIO_OPTIONS } from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class ServicioOptionsService {
  getProcedencias(): Observable<FormFieldOption[]> {
    // Un servicio pertenece a una sola sede: "Ambos" no es una procedencia válida para él
    // (mismo criterio que reserva-form-base.ts al filtrar este selector).
    return of(PROCEDENCIA_OPTIONS.filter((option) => option.value !== Procedencia.Ambos));
  }

  getModalidades(): Observable<FormFieldOption[]> {
    return of(MODALIDAD_PRECIO_OPTIONS);
  }
}
