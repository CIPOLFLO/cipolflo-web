import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { CedulaFormatPipe } from './cedula-format.pipe';

describe('CedulaFormatPipe', () => {
  const pipe = new CedulaFormatPipe();

  it('debe formatear 8 dígitos al formato x.xxx.xxx-x', () => {
    expect(pipe.transform('12345678')).toBe('1.234.567-8');
  });

  it('debe normalizar una cédula ya formateada', () => {
    expect(pipe.transform('1.234.567-8')).toBe('1.234.567-8');
  });

  it('debe retornar el valor original si no tiene 8 dígitos', () => {
    expect(pipe.transform('1234')).toBe('1234');
  });

  it('debe retornar cadena vacía cuando el valor es null o undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('debe retornar cadena vacía cuando el valor es vacío', () => {
    expect(pipe.transform('')).toBe('');
  });
});
