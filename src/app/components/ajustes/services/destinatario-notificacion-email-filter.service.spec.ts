import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DestinatarioNotificacionEmailFilterService } from './destinatario-notificacion-email-filter.service';

describe('DestinatarioNotificacionEmailFilterService', () => {
  let service: DestinatarioNotificacionEmailFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DestinatarioNotificacionEmailFilterService] });
    service = TestBed.inject(DestinatarioNotificacionEmailFilterService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe definir el filtro de alias como texto', () => {
    const field = service.filterFields().find((f) => f.key === 'alias');
    expect(field).toMatchObject({ type: 'text' });
  });

  it('debe definir el filtro de activo con opción "Todos" primero', () => {
    const field = service.filterFields().find((f) => f.key === 'activo');
    expect(field?.type).toBe('select');
    expect(field?.options?.[0]).toEqual({ label: 'Todos', value: '' });
  });
});
