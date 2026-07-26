import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ServicioValidacionesService {
  cantidadOCapacidadExcluyentes(group: AbstractControl): ValidationErrors | null {
    const cantidad = group.get('cantidad')?.value;
    const capacidad = group.get('capacidad')?.value;
    if (cantidad != null && capacidad != null) {
      return { cantidadYCapacidad: true };
    }
    return null;
  }

  getInfoErrors(form: FormGroup, submitted: boolean): Record<string, string> {
    const errs: Record<string, string> = {};
    const procedencia = form.get('procedencia')!;
    const nombre = form.get('nombre')!;
    const estado = form.get('estado');
    const cantidad = form.get('cantidad');
    const capacidad = form.get('capacidad');

    if ((submitted || procedencia.touched) && procedencia.hasError('required')) {
      errs['procedencia'] = 'La procedencia es obligatoria.';
    }
    if ((submitted || nombre.touched) && nombre.hasError('required')) {
      errs['nombre'] = 'El nombre del servicio es obligatorio.';
    }
    if (estado && (submitted || estado.touched) && estado.hasError('required')) {
      errs['estado'] = 'El estado es obligatorio.';
    }
    if (
      (submitted || cantidad?.touched || capacidad?.touched) &&
      form.errors?.['cantidadYCapacidad']
    ) {
      errs['capacidad'] = 'Solo se puede completar cantidad o capacidad, no ambas.';
    }
    return errs;
  }

  getPreciosErrors(form: FormGroup, submitted: boolean): Record<string, string> {
    const errs: Record<string, string> = {};
    const costoExtra = form.get('costoPersonaExtra');
    if (costoExtra && (submitted || costoExtra.touched) && costoExtra.hasError('min')) {
      errs['costoPersonaExtra'] = 'El costo por persona extra no puede ser negativo.';
    }

    return errs;
  }
}
