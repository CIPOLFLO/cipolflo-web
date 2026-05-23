import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

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

  precioSocioMenorQueParticular(group: AbstractControl): ValidationErrors | null {
    const particular = group.get('precioParticular')?.value as number | null;
    const socio = group.get('precioSocio')?.value as number | null;
    if (particular != null && particular > 0 && socio != null && socio > 0 && socio >= particular) {
      return { precioSocioMayor: true };
    }
    return null;
  }
}
