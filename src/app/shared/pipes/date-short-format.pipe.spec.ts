import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { DateShortFormatPipe } from '../index';

describe('DateShortFormatPipe', () => {
  const pipe = new DateShortFormatPipe();

  it('debe formatear una fecha ISO a "d mmm yyyy" en UTC', () => {
    expect(pipe.transform('2026-06-07T14:00:00Z')).toBe('7 jun 2026');
  });

  it('no debe agregar cero al día cuando es menor a 10', () => {
    expect(pipe.transform('2026-01-05T00:00:00Z')).toBe('5 ene 2026');
  });

  it('debe usar la fecha UTC, no la local (sin desfase de timezone)', () => {
    // Medianoche UTC: debe mostrarse como día 1, no como el día anterior
    expect(pipe.transform('2026-06-01T00:00:00Z')).toBe('1 jun 2026');
  });

  it('debe formatear el último día del año correctamente', () => {
    expect(pipe.transform('2026-12-31T23:59:59Z')).toBe('31 dic 2026');
  });

  it('debe devolver cadena vacía cuando el valor es null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('debe devolver cadena vacía cuando el valor es undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('debe devolver cadena vacía cuando la fecha es inválida', () => {
    expect(pipe.transform('no-es-una-fecha')).toBe('');
  });
});
