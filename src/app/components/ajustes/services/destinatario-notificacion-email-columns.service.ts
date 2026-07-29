import { Injectable } from '@angular/core';
import { ColumnConfig } from '../../../shared';

@Injectable()
export class DestinatarioNotificacionEmailColumnsService {
  readonly columns: ColumnConfig[] = [
    { key: 'email', label: 'Email' },
    { key: 'alias', label: 'Alias' },
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
