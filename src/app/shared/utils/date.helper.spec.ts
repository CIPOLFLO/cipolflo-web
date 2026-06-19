import { describe, expect, it } from 'vitest';
import { parseIsoDate, startOfToday, toDisplayDate, toIsoDate } from './date.helper';

describe('startOfToday', () => {
  it('devuelve la fecha de hoy sin componente horario', () => {
    const hoy = startOfToday();
    const now = new Date();
    expect(hoy.getFullYear()).toBe(now.getFullYear());
    expect(hoy.getMonth()).toBe(now.getMonth());
    expect(hoy.getDate()).toBe(now.getDate());
    expect([hoy.getHours(), hoy.getMinutes(), hoy.getSeconds()]).toEqual([0, 0, 0]);
  });
});

describe('parseIsoDate', () => {
  it('convierte yyyy-MM-dd a Date local a medianoche', () => {
    const fecha = parseIsoDate('2026-06-29');
    expect(fecha?.getFullYear()).toBe(2026);
    expect(fecha?.getMonth()).toBe(5);
    expect(fecha?.getDate()).toBe(29);
  });

  it('devuelve null para vacío, null o cadena incompleta', () => {
    expect(parseIsoDate('')).toBeNull();
    expect(parseIsoDate(null)).toBeNull();
    expect(parseIsoDate('2026-06')).toBeNull();
    expect(parseIsoDate('texto')).toBeNull();
  });
});

describe('toIsoDate', () => {
  it('formatea una Date como yyyy-MM-dd con padding', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('devuelve null si no hay fecha', () => {
    expect(toIsoDate(null)).toBeNull();
    expect(toIsoDate(undefined)).toBeNull();
  });
});

describe('toDisplayDate', () => {
  it('formatea una Date como dd/MM/yyyy con padding', () => {
    expect(toDisplayDate(new Date(2026, 0, 5))).toBe('05/01/2026');
  });

  it('devuelve cadena vacía si no hay fecha', () => {
    expect(toDisplayDate(null)).toBe('');
  });
});
