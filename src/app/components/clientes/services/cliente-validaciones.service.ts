import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { parseIsoDate } from '../../../shared';

@Injectable({ providedIn: 'root' })
export class ClienteValidacionesService {
  mayorDeEdad(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string | null;
    if (!value) return null;
    const fechaNacimiento = parseIsoDate(value);
    if (!fechaNacimiento) {
      return { fechaInvalida: true };
    }
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad >= 18 ? null : { menorDeEdad: true };
  }

  cedulaValida(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string | null;

    if (!value) return null;

    const cedula = value.replace(/\D/g, '');

    if (cedula.length < 7 || cedula.length > 8) {
      return { cedulaInvalida: true };
    }

    const padded = cedula.padStart(8, '0');
    const digits = padded.split('').map(Number);
    const factors = [2, 9, 8, 7, 6, 3, 4];

    const sum = factors.reduce((acc, factor, index) => acc + factor * digits[index], 0);
    const expectedVerifier = (10 - (sum % 10)) % 10;
    const verifier = digits[7];

    return verifier === expectedVerifier ? null : { cedulaInvalida: true };
  }

  rutValida(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string | null;

    if (!value) return null;

    const rut = value.replace(/\D/g, '');

    if (rut.length !== 12) {
      return { rutInvalido: true };
    }

    const digits = rut.split('').map(Number);
    const factors = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const sum = factors.reduce((acc, factor, index) => acc + factor * digits[index], 0);
    const resto = sum % 11;
    const expectedVerifier = (11 - resto) % 11;
    const verifier = digits[11];

    return verifier === expectedVerifier ? null : { rutInvalido: true };
  }

  getClienteErrors(form: FormGroup, submitted: boolean): Record<string, string> {
    const errors: Record<string, string> = {};

    this.addRequiredError(errors, form, submitted, 'nombre', 'El nombre es obligatorio.');
    this.addRequiredError(errors, form, submitted, 'cedula', 'La cédula es obligatoria.');
    this.addRequiredError(
      errors,
      form,
      submitted,
      'fechaNacimiento',
      'La fecha de nacimiento es obligatoria.',
    );
    this.addRequiredError(errors, form, submitted, 'telefono', 'El teléfono es obligatorio.');
    this.addRequiredError(
      errors,
      form,
      submitted,
      'metodoCobro',
      'El método de pago es obligatorio.',
    );
    this.addRequiredError(
      errors,
      form,
      submitted,
      'fechaIngreso',
      'La fecha de ingreso es obligatoria.',
    );

    const cedula = form.get('cedula');
    const fechaNacimiento = form.get('fechaNacimiento');
    const email = form.get('email');
    const fechaIngreso = form.get('fechaIngreso');

    if (this.shouldShowError(cedula, submitted) && cedula?.hasError('cedulaInvalida')) {
      errors['cedula'] = 'La cédula no es válida.';
    }
    if (
      this.shouldShowError(fechaNacimiento, submitted) &&
      fechaNacimiento?.hasError('menorDeEdad')
    ) {
      errors['fechaNacimiento'] = 'El cliente debe ser mayor de 18 años.';
    }
    if (
      this.shouldShowError(email, submitted) &&
      (email?.hasError('emailInvalido') || email?.hasError('email'))
    ) {
      errors['email'] = 'El email no es válido.';
    }
    if (
      this.shouldShowError(fechaIngreso, submitted) &&
      fechaIngreso?.hasError('fechaIngresoFutura')
    ) {
      errors['fechaIngreso'] = 'La fecha de ingreso no puede ser posterior a hoy.';
    }

    return errors;
  }

  getEmpresaErrors(form: FormGroup, submitted: boolean): Record<string, string> {
    const errors: Record<string, string> = {};

    this.addRequiredError(
      errors,
      form,
      submitted,
      'razonSocial',
      'La razón social es obligatoria.',
    );
    this.addRequiredError(errors, form, submitted, 'rut', 'El RUT es obligatorio.');
    this.addRequiredError(errors, form, submitted, 'telefono', 'El teléfono es obligatorio.');

    const rut = form.get('rut');
    const mail = form.get('mail');

    if (this.shouldShowError(rut, submitted) && rut?.hasError('rutInvalido')) {
      errors['rut'] = 'El RUT no es válido.';
    }

    if (
      this.shouldShowError(mail, submitted) &&
      (mail?.hasError('emailInvalido') || mail?.hasError('email'))
    ) {
      errors['mail'] = 'El email no es válido.';
    }

    return errors;
  }

  getUbicacionErrors(form: FormGroup, submitted: boolean): Record<string, string> {
    const errors: Record<string, string> = {};

    this.addRequiredError(errors, form, submitted, 'pais', 'El país es obligatorio.');
    this.addRequiredError(
      errors,
      form,
      submitted,
      'departamento',
      'El departamento es obligatorio.',
    );
    this.addRequiredError(errors, form, submitted, 'ciudad', 'La ciudad es obligatoria.');
    this.addRequiredError(errors, form, submitted, 'direccion', 'La dirección es obligatoria.');

    return errors;
  }

  fechaIngresoValida(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string | null;
    if (!value) return null;
    const fechaIngreso = parseIsoDate(value);
    if (!fechaIngreso) {
      return { fechaInvalida: true };
    }
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaIngreso.setHours(0, 0, 0, 0);

    return fechaIngreso <= hoy ? null : { fechaIngresoFutura: true };
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
