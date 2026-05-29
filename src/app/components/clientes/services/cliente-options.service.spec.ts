import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { MetodoCobro } from '../models/cliente.model';
import { ClienteOptionsService } from './cliente-options.service';

describe('ClienteOptionsService', () => {
  let service: ClienteOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClienteOptionsService);
  });

  it('getMetodosPago retorna un array no vacío con label y value', () => {
    let result: { label: string; value: string }[] = [];

    service.getMetodosPago().subscribe((options) => (result = options));

    expect(result.length).toBeGreaterThan(0);
    result.forEach((option) => {
      expect(option).toHaveProperty('label');
      expect(option).toHaveProperty('value');
    });
  });

  it('getMetodosPago incluye la opción COBRADORA', () => {
    let result: { label: string; value: string }[] = [];

    service.getMetodosPago().subscribe((options) => (result = options));

    expect(result.some((option) => option.value === MetodoCobro.Cobradora)).toBe(true);
  });
});
