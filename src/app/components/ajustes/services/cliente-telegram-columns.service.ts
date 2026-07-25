import { Injectable } from '@angular/core';
import { ColumnConfig } from '../../../shared';

@Injectable()
export class ClienteTelegramColumnsService {
  readonly columns: ColumnConfig[] = [
    { key: 'chatId', label: 'Chat ID' },
    { key: 'alias', label: 'Alias' },
    {
      key: 'recibeNotificaciones',
      label: 'Notificaciones',
      transform: (v) => (v ? 'Sí' : 'No'),
    },
    {
      key: 'activo',
      label: 'Estado',
      cellType: 'tag',
      tagMap: {
        true: { styleClass: 'tag--green', label: 'Activo' },
        false: { styleClass: 'tag--gray', label: 'Inactivo' },
      },
    },
    { key: 'createdAt', label: 'Fecha de alta', cellType: 'date' },
  ];
}
