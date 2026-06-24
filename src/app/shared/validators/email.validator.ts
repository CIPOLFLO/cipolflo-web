import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador de email reutilizable. No exige nada si el campo está vacío (opcional);
 * cuando hay valor, verifica un formato básico y devuelve `{ emailInvalido: true }` si no cumple.
 */
export function emailValido(control: AbstractControl): ValidationErrors | null {
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
