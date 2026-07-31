import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Procedencia } from '../../../shared';
import { ServiciosFilterService } from './servicios-filter.service';

describe('ServiciosFilterService', () => {
  let service: ServiciosFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ServiciosFilterService] });
    service = TestBed.inject(ServiciosFilterService);
  });

  it('procedencia incluye "Todos" como primera opción', () => {
    const field = service.filterFields().find((f) => f.key === 'procedencia');
    expect(field?.options?.[0]).toEqual({ label: 'Todos', value: '' });
  });

  it('procedencia no incluye "Ambos" (un servicio pertenece a una sola sede)', () => {
    const field = service.filterFields().find((f) => f.key === 'procedencia');
    expect(field?.options?.some((o) => o.value === Procedencia.Ambos)).toBe(false);
  });

  it('procedencia incluye Sede y Camping', () => {
    const field = service.filterFields().find((f) => f.key === 'procedencia');
    expect(field?.options).toEqual([
      { label: 'Todos', value: '' },
      { label: 'Sede', value: Procedencia.Sede },
      { label: 'Camping', value: Procedencia.Camping },
    ]);
  });
});
