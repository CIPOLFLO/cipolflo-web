import { FormControl } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { emailValido } from './email.validator';

describe('emailValido', () => {
  it('retorna null cuando el campo está vacío (opcional)', () => {
    expect(emailValido(new FormControl(null))).toBeNull();
    expect(emailValido(new FormControl(''))).toBeNull();
  });

  it('retorna null con un email válido', () => {
    expect(emailValido(new FormControl('cliente@example.com'))).toBeNull();
  });

  it('retorna { emailInvalido: true } con un email inválido', () => {
    expect(emailValido(new FormControl('email-invalido'))).toEqual({ emailInvalido: true });
    expect(emailValido(new FormControl('a@b'))).toEqual({ emailInvalido: true });
    expect(emailValido(new FormControl('a @b.com'))).toEqual({ emailInvalido: true });
  });
});
