import { Injectable, signal } from '@angular/core';
import { FilterConfigProvider } from '../../../shared/services/filter-config.provider';
import { FormFieldConfig } from '../../../shared/models/form-field.model';

@Injectable()
export class ClientesFilterService extends FilterConfigProvider {
  readonly filterFields = signal<FormFieldConfig[]>([
    {
      key: 'tipoCliente',
      label: 'Tipo de cliente',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { label: 'Todos', value: '' },
        { label: 'Socio', value: 'SOCIO' },
        { label: 'Particular', value: 'PARTICULAR' },
      ],
    },
    {
      key: 'nombre',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Buscar por nombre del cliente...',
    },
    {
      key: 'cedula',
      label: 'Cédula / Número de socio',
      type: 'text',
      placeholder: 'Buscar por cédula o número de socio...',
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { label: 'Todos', value: '' },
        { label: 'Activo', value: 'ACTIVO' },
        { label: 'Inactivo', value: 'INACTIVO' },
        { label: 'De baja', value: 'BAJA' },
      ],
    },
  ]);
}
