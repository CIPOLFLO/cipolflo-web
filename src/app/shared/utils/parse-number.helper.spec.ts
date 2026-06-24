import { describe, it, expect } from 'vitest';
import { parseNumberOrNull } from './parse-number.helper';

describe('parseNumberOrNull', () => {
  it('devuelve null para null y string vacío', () => {
    expect(parseNumberOrNull(null)).toBeNull();
    expect(parseNumberOrNull('')).toBeNull();
  });

  it('devuelve null para valores no numéricos', () => {
    expect(parseNumberOrNull('abc')).toBeNull();
  });

  it('parsea números, conservando el 0', () => {
    expect(parseNumberOrNull('0')).toBe(0);
    expect(parseNumberOrNull('5')).toBe(5);
    expect(parseNumberOrNull('-1')).toBe(-1);
  });
});
