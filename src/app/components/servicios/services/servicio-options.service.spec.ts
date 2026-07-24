import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ServicioOptionsService } from './servicio-options.service';

describe('ServicioOptionsService', () => {
  let service: ServicioOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioOptionsService);
  });

  describe('getProcedencias', () => {
    it('retorna un array no vacío con label y value', () => {
      let result: { label: string; value: string }[] = [];
      service.getProcedencias().subscribe((options) => (result = options));
      expect(result.length).toBeGreaterThan(0);
      result.forEach((option) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('value');
      });
    });

    it('incluye la opción SEDE', () => {
      let result: { label: string; value: string }[] = [];
      service.getProcedencias().subscribe((options) => (result = options));
      expect(result.some((o) => o.value === 'SEDE')).toBe(true);
    });

    it('incluye la opción CAMPING', () => {
      let result: { label: string; value: string }[] = [];
      service.getProcedencias().subscribe((options) => (result = options));
      expect(result.some((o) => o.value === 'CAMPING')).toBe(true);
    });

    it('no incluye la opción AMBOS: un servicio pertenece a una sola sede', () => {
      let result: { label: string; value: string }[] = [];
      service.getProcedencias().subscribe((options) => (result = options));
      expect(result.some((o) => o.value === 'AMBOS')).toBe(false);
    });
  });

  describe('getModalidades', () => {
    it('retorna un array no vacío', () => {
      let result: { label: string; value: string }[] = [];
      service.getModalidades().subscribe((options) => (result = options));
      expect(result.length).toBeGreaterThan(0);
    });

    it('incluye la opción POR_DIA', () => {
      let result: { label: string; value: string }[] = [];
      service.getModalidades().subscribe((options) => (result = options));
      expect(result.some((o) => o.value === 'POR_DIA')).toBe(true);
    });
  });
});
