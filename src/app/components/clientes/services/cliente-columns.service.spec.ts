import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { EstadoSocio } from '../models/cliente.model';
import { ClientesColumnsService } from './cliente-columns.service';

describe('ClientesColumnsService', () => {
  let service: ClientesColumnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ClientesColumnsService] });
    service = TestBed.inject(ClientesColumnsService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe definir 8 columnas', () => {
    expect(service.columns.length).toBe(8);
  });

  it('debe definir columna nombreCompleto como sortable', () => {
    const col = service.columns.find((c) => c.key === 'nombreCompleto');
    expect(col).toMatchObject({ key: 'nombreCompleto', label: 'Nombre', sortable: true });
  });

  it('debe definir columna numeroSocio', () => {
    const col = service.columns.find((c) => c.key === 'numeroSocio');
    expect(col).toMatchObject({ key: 'numeroSocio', label: 'Nro de socio' });
  });

  it('debe definir columna documento', () => {
    const col = service.columns.find((c) => c.key === 'documento');
    expect(col).toMatchObject({ key: 'documento', label: 'Documento' });
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
        [EstadoSocio.Activo]: { styleClass: 'tag--green', label: 'Activo' },
        [EstadoSocio.Inactivo]: { styleClass: 'tag--yellow', label: 'Inactivo' },
        [EstadoSocio.Baja]: { styleClass: 'tag--gray', label: 'De baja' },
      },
    });
  });
  it('debe incluir las columnas categoría y antigüedad después de estado', () => {
    expect(service.columns.map((column) => column.key)).toEqual([
      'nombreCompleto',
      'numeroSocio',
      'ultimaCuotaDto',
      'documento',
      'email',
      'estado',
      'categoriaSocio',
      'antiguedad',
    ]);
  });
});
