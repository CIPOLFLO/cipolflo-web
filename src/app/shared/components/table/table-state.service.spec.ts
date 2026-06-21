import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { TableStateService } from './table-state.service';

describe('TableStateService', () => {
  let service: TableStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableStateService],
    });
    service = TestBed.inject(TableStateService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('totalElements inicia en 0', () => {
    expect(service.totalElements()).toBe(0);
  });

  it('loading inicia en false', () => {
    expect(service.loading()).toBe(false);
  });

  it('hasResults es false cuando totalElements es 0', () => {
    expect(service.hasResults()).toBe(false);
  });

  it('setResult actualiza totalElements', () => {
    service.setResult(5);
    expect(service.totalElements()).toBe(5);
  });

  it('hasResults es true cuando totalElements es mayor a 0', () => {
    service.setResult(1);
    expect(service.hasResults()).toBe(true);
  });

  it('hasResults vuelve a false cuando totalElements vuelve a 0', () => {
    service.setResult(5);
    service.setResult(0);
    expect(service.hasResults()).toBe(false);
  });

  it('setLoading actualiza loading a true', () => {
    service.setLoading(true);
    expect(service.loading()).toBe(true);
  });

  it('setLoading actualiza loading a false', () => {
    service.setLoading(true);
    service.setLoading(false);
    expect(service.loading()).toBe(false);
  });
});
