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

  it('debe formatear 7 dígitos al formato xxx.xxx-x', () => {
    // 1000001 es una cédula válida de numeración baja: el validador (front y back) acepta
    // 7 dígitos, así que el pipe también tiene que formatearla.
    expect(pipe.transform('1000001')).toBe('100.000-1');
  });

  it('debe normalizar una cédula de 7 dígitos ya formateada', () => {
    expect(pipe.transform('100.000-1')).toBe('100.000-1');
  });

  it('debe retornar el valor original si tiene menos de 7 dígitos', () => {
    expect(pipe.transform('1234')).toBe('1234');
  });

  it('debe retornar el valor original si tiene más de 8 dígitos', () => {
    expect(pipe.transform('123456789')).toBe('123456789');
  });

  it('debe retornar cadena vacía cuando el valor es null o undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('debe retornar cadena vacía cuando el valor es vacío', () => {
    expect(pipe.transform('')).toBe('');
  });
});
