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

  precioSocioMenorQueParticular(group: AbstractControl): ValidationErrors | null {
    const particular = group.get('precioParticular')?.value as number | null;
    const socio = group.get('precioSocio')?.value as number | null;
    if (particular != null && particular > 0 && socio != null && socio > 0 && socio >= particular) {
      return { precioSocioMayor: true };
    }
    return null;
  }

  /**
   * @param cantidadErrorOnSubmitOnly - true: el error de cantidadYCapacidad solo aparece
   * tras submit (editar). false: aparece en cuanto ambos campos tienen valor (nuevo).
   */
  getInfoErrors(
    form: FormGroup,
    submitted: boolean,
    opts: { cantidadErrorOnSubmitOnly?: boolean } = {},
  ): Record<string, string> {
    const errs: Record<string, string> = {};
    const procedencia = form.get('procedencia')!;
    const nombre = form.get('nombre')!;
    const estado = form.get('estado');

    if ((submitted || procedencia.touched) && procedencia.hasError('required')) {
      errs['procedencia'] = 'La procedencia es obligatoria.';
    }
    if ((submitted || nombre.touched) && nombre.hasError('required')) {
      errs['nombre'] = 'El nombre del servicio es obligatorio.';
    }
    if (estado && (submitted || estado.touched) && estado.hasError('required')) {
      errs['estado'] = 'El estado es obligatorio.';
    }
    const showCantidad = opts.cantidadErrorOnSubmitOnly ? submitted : true;
    if (showCantidad && form.errors?.['cantidadYCapacidad']) {
      errs['capacidad'] = 'Solo se puede completar cantidad o capacidad, no ambas.';
    }
    return errs;
  }

  getPreciosErrors(form: FormGroup, submitted: boolean): Record<string, string> {
    const errs: Record<string, string> = {};
    const particular = form.get('precioParticular')!;
    const socio = form.get('precioSocio')!;
    const modalidad = form.get('modalidadPrecio')!;

    if ((submitted || particular.touched) && particular.hasError('required')) {
      errs['precioParticular'] = 'El precio para particulares es obligatorio.';
    } else if ((submitted || particular.touched) && particular.hasError('min')) {
      errs['precioParticular'] = 'El precio debe ser mayor que 0.';
    }

    if ((submitted || socio.touched) && socio.hasError('required')) {
      errs['precioSocio'] = 'El precio para socios es obligatorio.';
    } else if ((submitted || socio.touched) && socio.hasError('min')) {
      errs['precioSocio'] = 'El precio debe ser mayor que 0.';
    } else if (form.errors?.['precioSocioMayor']) {
      errs['precioSocio'] = 'Debe ser menor al precio para particulares.';
    }

    if ((submitted || modalidad.touched) && modalidad.hasError('required')) {
      errs['modalidadPrecio'] = 'El tipo de cobro es obligatorio.';
    }

    return errs;
  }
}
