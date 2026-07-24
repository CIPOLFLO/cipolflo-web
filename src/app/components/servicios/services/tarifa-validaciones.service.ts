import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { TipoClienteTarifa } from '../models/servicio.model';

@Injectable({ providedIn: 'root' })
export class TarifaValidacionesService {
  rangoAntiguedadInvalido(group: AbstractControl): ValidationErrors | null {
    const minima = group.get('antiguedadMinima')?.value as number | null;
    const maxima = group.get('antiguedadMaxima')?.value as number | null;
    if (minima != null && maxima != null && minima > maxima) {
      return { rangoAntiguedadInvalido: true };
    }
    return null;
  }

  antiguedadNoAplicaAParticular(group: AbstractControl): ValidationErrors | null {
    const tipoCliente = group.get('tipoCliente')?.value as TipoClienteTarifa | null;
    const minima = group.get('antiguedadMinima')?.value;
    const maxima = group.get('antiguedadMaxima')?.value;
    if (tipoCliente === TipoClienteTarifa.Particular && (minima != null || maxima != null)) {
      return { antiguedadNoAplicaAParticular: true };
    }
    return null;
  }

  obligatoriasFaltantes(array: AbstractControl): ValidationErrors | null {
    const filas = (array.value ?? []) as { tipoCliente: TipoClienteTarifa | null }[];
    const tieneParticular = filas.some((f) => f.tipoCliente === TipoClienteTarifa.Particular);
    const tieneSocioComun = filas.some((f) => f.tipoCliente === TipoClienteTarifa.SocioComun);
    if (!tieneParticular || !tieneSocioComun) {
      return { tarifasObligatoriasFaltantes: true };
    }
    return null;
  }
}
