import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DestinatarioNotificacionEmailColumnsService } from './destinatario-notificacion-email-columns.service';

describe('DestinatarioNotificacionEmailColumnsService', () => {
  let service: DestinatarioNotificacionEmailColumnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DestinatarioNotificacionEmailColumnsService] });
    service = TestBed.inject(DestinatarioNotificacionEmailColumnsService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe definir 4 columnas', () => {
    expect(service.columns.length).toBe(4);
  });

  it('debe definir columna email', () => {
    const col = service.columns.find((c) => c.key === 'email');
    expect(col).toMatchObject({ label: 'Email' });
  });

  it('debe definir columna alias', () => {
    const col = service.columns.find((c) => c.key === 'alias');
    expect(col).toMatchObject({ label: 'Alias' });
  });

  it('debe definir columna activo con cellType tag y tagMap Activo/Inactivo', () => {
    const col = service.columns.find((c) => c.key === 'activo');
    expect(col).toMatchObject({
      cellType: 'tag',
      tagMap: {
        true: { styleClass: 'tag--green', label: 'Activo' },
        false: { styleClass: 'tag--gray', label: 'Inactivo' },
      },
    });
  });

  it('debe definir columna createdAt con cellType date', () => {
    const col = service.columns.find((c) => c.key === 'createdAt');
    expect(col).toMatchObject({ label: 'Fecha de alta', cellType: 'date' });
  });
});
