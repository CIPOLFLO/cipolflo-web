import { Procedencia, PROCEDENCIA_LABEL, PROCEDENCIA_OPTIONS } from './procedencia.model';

describe('PROCEDENCIA_OPTIONS', () => {
  it('debe contener una opción por cada valor del enum Procedencia', () => {
    expect(PROCEDENCIA_OPTIONS.length).toBe(Object.values(Procedencia).length);
  });

  it('debe tener value igual al valor del enum y label igual a PROCEDENCIA_LABEL', () => {
    PROCEDENCIA_OPTIONS.forEach((option, i) => {
      const enumValue = Object.values(Procedencia)[i];
      expect(option.value).toBe(enumValue);
      expect(option.label).toBe(PROCEDENCIA_LABEL[enumValue]);
    });
  });
});
