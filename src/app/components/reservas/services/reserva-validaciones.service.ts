import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

/**
 * Errores por sección del formulario de reserva. La obligatoriedad condicional
 * (según tipo de reserva y según el modo capacidad/cantidad del servicio) la define
 * el form a través de sus validadores; este servicio sólo traduce los errores a mensajes.
 */
@Injectable({ providedIn: 'root' })
export class ReservaValidacionesService {
  getReservaErrors(form: FormGroup, submitted: boolean): Record<string, string> {
    const errors: Record<string, string> = {};
    this.addRequiredError(errors, form, submitted, 'procedencia', 'La procedencia es obligatoria.');
    this.addRequiredError(errors, form, submitted, 'servicioId', 'El servicio es obligatorio.');
    this.addRequiredError(
      errors,
      form,
      submitted,
      'fechaInicio',
      'La fecha de inicio es obligatoria.',
    );
    this.addRequiredError(errors, form, submitted, 'fechaFin', 'La fecha de fin es obligatoria.');
    this.addRequiredError(
      errors,
      form,
      submitted,
      'cantidadTotal',
      'La cantidad total es obligatoria.',
    );
    this.addRequiredError(errors, form, submitted, 'cantidad', 'La cantidad es obligatoria.');
    this.addRequiredError(
      errors,
      form,
      submitted,
      'horaInicio',
      'La hora de inicio es obligatoria.',
    );
    this.addRequiredError(errors, form, submitted, 'horaFin', 'La hora de fin es obligatoria.');

    // El error de cantidad negativa se muestra de inmediato, sin esperar blur/submit.
    for (const key of ['cantidadTotal', 'cantidadMenores', 'cantidad']) {
      if (form.get(key)?.hasError('min')) {
        errors[key] = 'La cantidad no puede ser negativa.';
      }
    }
    return errors;
  }

  getClienteErrors(form: FormGroup, submitted: boolean): Record<string, string> {
    const errors: Record<string, string> = {};
    this.addRequiredError(errors, form, submitted, 'documento', 'El documento es obligatorio.');
    this.addRequiredError(errors, form, submitted, 'nombre', 'El nombre es obligatorio.');
    this.addRequiredError(errors, form, submitted, 'celular', 'El celular es obligatorio.');

    const documento = form.get('documento');
    if (this.shouldShowError(documento, submitted)) {
      if (documento?.hasError('cedulaInvalida')) {
        errors['documento'] = 'La cédula ingresada no es válida.';
      } else if (documento?.hasError('rutInvalido')) {
        errors['documento'] = 'El RUT ingresado no es válido.';
      } else if (documento?.hasError('rutNoEncontrado')) {
        errors['documento'] = 'No se encontró ninguna Empresa registrada con ese RUT.';
      }
    }

    const email = form.get('email');
    if (this.shouldShowError(email, submitted) && email?.hasError('emailInvalido')) {
      errors['email'] = 'El email no es válido.';
    }
    return errors;
  }

  private addRequiredError(
    errors: Record<string, string>,
    form: FormGroup,
    submitted: boolean,
    key: string,
    message: string,
  ): void {
    const control = form.get(key);
    if (this.shouldShowError(control, submitted) && control?.hasError('required')) {
      errors[key] = message;
    }
  }

  private shouldShowError(control: AbstractControl | null, submitted: boolean): boolean {
    return submitted || !!control?.touched;
  }
}
