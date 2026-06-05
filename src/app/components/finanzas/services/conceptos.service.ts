import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { FormFieldOption } from '../../../shared';
import { CONCEPTO_LABEL, Concepto } from '../models/finanza.model';

@Injectable({ providedIn: 'root' })
export class ConceptosService extends BaseHttpService {
  getOpciones(): Observable<FormFieldOption[]> {
    // TODO: reemplazar cuando el backend esté disponible
    // return this.get<FormFieldOption[]>('finanzas/conceptos');
    return of(
      (Object.entries(CONCEPTO_LABEL) as [Concepto, string][]).map(([value, label]) => ({
        label,
        value,
      })),
    );
  }
}
