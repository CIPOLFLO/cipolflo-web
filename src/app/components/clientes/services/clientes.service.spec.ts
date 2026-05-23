import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ClientesService } from './clientes.service';
import { EstadoCliente, TipoCliente } from '../models/cliente.model';

describe('ClientesService', () => {
  let service: ClientesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ClientesService] });
    service = TestBed.inject(ClientesService);
  });

  const base = { page: 0, size: 10, filters: {} };

  const getDatos = (overrides: Parameters<ClientesService['getDatos']>[0]) => {
    let result: ReturnType<ClientesService['getDatos']> extends import('rxjs').Observable<infer T>
      ? T
      : never;
    service.getDatos(overrides).subscribe((r) => (result = r));
    return result!;
  };

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('sin filtros devuelve todos los clientes', () => {
    const res = getDatos({ ...base, filters: {} });
    expect(res.totalElements).toBe(8);
  });

  it('con filters null usa {} como fallback (rama defensiva)', () => {
    const res = getDatos({ ...base, filters: null as unknown as Record<string, string | null> });
    expect(res.totalElements).toBe(8);
  });

  it('con filters vacío devuelve todos los clientes sin filtrar', () => {
    const res = getDatos({ ...base, filters: {} });
    expect(res.content.length).toBe(res.totalElements);
  });

  it('filtra por nombre de forma parcial e insensible a mayúsculas', () => {
    const res = getDatos({ ...base, filters: { nombre: 'juan' } });
    expect(res.totalElements).toBe(1);
    expect(res.content[0].nombre).toBe('Juan Perez');
  });

  it('filtro nombre sin coincidencias devuelve lista vacía', () => {
    const res = getDatos({ ...base, filters: { nombre: 'zzz' } });
    expect(res.totalElements).toBe(0);
  });

  it('filtra por cédula de forma parcial', () => {
    const res = getDatos({ ...base, filters: { cedula: '1.234.567' } });
    expect(res.totalElements).toBe(1);
    expect(res.content[0].cedula).toBe('1.234.567-8');
  });

  it('filtra por número de socio vía campo cédula', () => {
    const res = getDatos({ ...base, filters: { cedula: '878' } });
    expect(res.totalElements).toBe(1);
    expect(res.content[0].numeroSocio).toBe('878');
  });

  it('filtro cédula sin coincidencias devuelve lista vacía', () => {
    const res = getDatos({ ...base, filters: { cedula: 'zzz' } });
    expect(res.totalElements).toBe(0);
  });

  it('filtra por tipoCliente SOCIO', () => {
    const res = getDatos({ ...base, filters: { tipoCliente: TipoCliente.Socio } });
    expect(res.totalElements).toBe(6);
    expect(res.content.every((c) => c.tipoCliente === TipoCliente.Socio)).toBe(true);
  });

  it('filtra por tipoCliente PARTICULAR', () => {
    const res = getDatos({ ...base, filters: { tipoCliente: TipoCliente.Particular } });
    expect(res.totalElements).toBe(2);
    expect(res.content.every((c) => c.tipoCliente === TipoCliente.Particular)).toBe(true);
  });

  it('filtra por estado ACTIVO', () => {
    const res = getDatos({ ...base, filters: { estado: EstadoCliente.Activo } });
    expect(res.totalElements).toBe(5);
    expect(res.content.every((c) => c.estado === EstadoCliente.Activo)).toBe(true);
  });

  it('filtra por estado INACTIVO', () => {
    const res = getDatos({ ...base, filters: { estado: EstadoCliente.Inactivo } });
    expect(res.totalElements).toBe(2);
  });

  it('filtra por estado BAJA', () => {
    const res = getDatos({ ...base, filters: { estado: EstadoCliente.Baja } });
    expect(res.totalElements).toBe(1);
    expect(res.content[0].nombre).toBe("George O'Malley");
  });

  it('combina filtros de tipo y estado', () => {
    const res = getDatos({
      ...base,
      filters: { tipoCliente: TipoCliente.Socio, estado: EstadoCliente.Activo },
    });
    expect(res.content.every((c) => c.tipoCliente === TipoCliente.Socio)).toBe(true);
    expect(res.content.every((c) => c.estado === EstadoCliente.Activo)).toBe(true);
  });

  it('devuelve la primera página con first=true y last=false', () => {
    const res = getDatos({ page: 0, size: 3, filters: {} });
    expect(res.content.length).toBe(3);
    expect(res.totalPages).toBe(3);
    expect(res.first).toBe(true);
    expect(res.last).toBe(false);
  });

  it('devuelve la última página con last=true y first=false', () => {
    const res = getDatos({ page: 2, size: 3, filters: {} });
    expect(res.last).toBe(true);
    expect(res.first).toBe(false);
    expect(res.page).toBe(2);
    expect(res.size).toBe(3);
  });
});
