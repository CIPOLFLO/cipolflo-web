import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { ClienteTelegramColumnsService } from './cliente-telegram-columns.service';

describe('ClienteTelegramColumnsService', () => {
  let service: ClienteTelegramColumnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ClienteTelegramColumnsService] });
    service = TestBed.inject(ClienteTelegramColumnsService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe definir 4 columnas', () => {
    expect(service.columns.length).toBe(4);
  });

  it('debe definir columna chatId', () => {
    const col = service.columns.find((c) => c.key === 'chatId');
    expect(col).toMatchObject({ label: 'Chat ID' });
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
