import { FormControl, FormGroup } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { applySectionChange, markFieldAsTouched } from './form-section.helper';

function buildForm(): FormGroup {
  return new FormGroup({
    nombre: new FormControl<string | null>(null),
    email: new FormControl<string | null>(null),
  });
}

describe('applySectionChange', () => {
  it('parchea valores, marca sucio y touched', () => {
    const form = buildForm();
    applySectionChange(form, { nombre: 'Pedro', email: null });

    expect(form.get('nombre')?.value).toBe('Pedro');
    expect(form.get('email')?.value).toBeNull();
    expect(form.dirty).toBe(true);
    expect(form.get('nombre')?.touched).toBe(true);
    expect(form.get('email')?.touched).toBe(true);
  });

  it('ignora claves que no existen en el form sin lanzar error', () => {
    const form = buildForm();
    expect(() => applySectionChange(form, { campoInexistente: 'valor' })).not.toThrow();
  });
});

describe('markFieldAsTouched', () => {
  it('marca el campo como touched', () => {
    const form = buildForm();
    markFieldAsTouched(form, 'nombre');
    expect(form.get('nombre')?.touched).toBe(true);
  });

  it('no lanza error con clave inexistente', () => {
    const form = buildForm();
    expect(() => markFieldAsTouched(form, 'noExiste')).not.toThrow();
  });
});
