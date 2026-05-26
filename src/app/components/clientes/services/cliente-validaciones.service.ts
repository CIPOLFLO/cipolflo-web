import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ClienteValidacionesService {
  mayorDeEdad(control: AbstractControl): ValidationErrors | null {
    const value = control.value as string | null;

    if (!value) return null;

    const fechaNacimiento = new Date(value);
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value) ? null : { emailInvalido: true };
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
}
