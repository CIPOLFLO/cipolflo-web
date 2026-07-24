import { Injectable, signal } from '@angular/core';
import { FilterConfigProvider, FormFieldConfig } from '../../../shared';
import { ACTIVO_OPTIONS } from '../models/ajuste.model';

@Injectable()
export class ClienteTelegramFilterService extends FilterConfigProvider {
  readonly filterFields = signal<FormFieldConfig[]>([
    {
      key: 'alias',
      label: 'Alias',
      type: 'text',
      placeholder: 'Buscar por alias...',
    },
    {
      key: 'activo',
      label: 'Estado',
      type: 'select',
      placeholder: 'Seleccionar estado',
      options: ACTIVO_OPTIONS,
    },
  ]);
}
