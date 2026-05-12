import { Procedencia, PROCEDENCIA_OPTIONS } from './procedencia.model';

describe('PROCEDENCIA_OPTIONS', () => {
  it('debe contener una opción por cada valor del enum Procedencia', () => {
    expect(PROCEDENCIA_OPTIONS.length).toBe(Object.values(Procedencia).length);
  });

  it('debe tener label y value iguales al valor del enum', () => {
    PROCEDENCIA_OPTIONS.forEach((option, i) => {
      const enumValue = Object.values(Procedencia)[i];
      expect(option.label).toBe(enumValue);
      expect(option.value).toBe(enumValue);
    });
  });
});
