import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ClienteValidacionesService {
  mayorDeEdad(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string | null;
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
      return { fechaInvalida: true };
    }
    const fechaNacimiento = new Date(year, month - 1, day);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad >= 18 ? null : { menorDeEdad: true };
  }

  emailValido(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string | null;

    if (!value) return null;

    const trimmed = value.trim();
    const atIndex = trimmed.indexOf('@');
    const lastAtIndex = trimmed.lastIndexOf('@');
    const lastDotIndex = trimmed.lastIndexOf('.');

    const isValid =
      atIndex > 0 &&
      atIndex === lastAtIndex &&
      lastDotIndex > atIndex + 1 &&
      lastDotIndex < trimmed.length - 1 &&
      !trimmed.includes(' ');

    return isValid ? null : { emailInvalido: true };
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
      'metodoPago',
      'El método de pago es obligatorio.',
    );
    const cedula = form.get('cedula');
    const fechaNacimiento = form.get('fechaNacimiento');
    const email = form.get('email');

    if (this.shouldShowError(cedula, submitted) && cedula?.hasError('cedulaInvalida')) {
      errors['cedula'] = 'La cédula no es válida.';
    }

    if (
      this.shouldShowError(fechaNacimiento, submitted) &&
      fechaNacimiento?.hasError('menorDeEdad')
    ) {
      errors['fechaNacimiento'] = 'El cliente debe ser mayor de 18 años.';
    }

    if (this.shouldShowError(email, submitted) && email?.hasError('emailInvalido')) {
      errors['email'] = 'El email no es válido.';
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
