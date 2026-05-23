import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ClientesColumnsService } from './clientes-columns.service';
import { EstadoCliente } from '../models/cliente.model';

describe('ClientesColumnsService', () => {
  let service: ClientesColumnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ClientesColumnsService] });
    service = TestBed.inject(ClientesColumnsService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe definir 5 columnas', () => {
    expect(service.columns.length).toBe(5);
  });

  it('debe definir columna nombre como sortable', () => {
    const col = service.columns.find((c) => c.key === 'nombre');
    expect(col).toMatchObject({ key: 'nombre', label: 'Nombre', sortable: true });
  });

  it('debe definir columna numeroSocio', () => {
    const col = service.columns.find((c) => c.key === 'numeroSocio');
    expect(col).toMatchObject({ key: 'numeroSocio', label: 'Nro de socio' });
  });

  it('debe definir columna cedula', () => {
    const col = service.columns.find((c) => c.key === 'cedula');
    expect(col).toMatchObject({ key: 'cedula', label: 'Cédula' });
  });

  it('debe definir columna email', () => {
    const col = service.columns.find((c) => c.key === 'email');
    expect(col).toMatchObject({ key: 'email', label: 'Email' });
  });

  it('debe definir columna estado con cellType tag', () => {
    const col = service.columns.find((c) => c.key === 'estado');
    expect(col).toBeDefined();
    expect(col!.cellType).toBe('tag');
  });

  it('debe definir tagMap correcto para los tres estados', () => {
    const col = service.columns.find((c) => c.key === 'estado');
    expect(col).toMatchObject({
      tagMap: {
        [EstadoCliente.Activo]: { styleClass: 'tag--green', label: 'Activo' },
        [EstadoCliente.Inactivo]: { styleClass: 'tag--yellow', label: 'Inactivo' },
        [EstadoCliente.Baja]: { styleClass: 'tag--gray', label: 'De baja' },
      },
    });
  });
});
