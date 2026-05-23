import { Injectable, signal } from '@angular/core';
import { FilterConfigProvider } from '../../../shared/services/filter-config.provider';
import { FormFieldConfig } from '../../../shared/models/form-field.model';
import {
  ESTADO_CLIENTE_OPTIONS,
  EstadoCliente,
  TIPO_CLIENTE_OPTIONS,
} from '../models/cliente.model';

@Injectable()
export class ClientesFilterService extends FilterConfigProvider {
  readonly filterFields = signal<FormFieldConfig[]>([
    {
      key: 'tipoCliente',
      label: 'Tipo de cliente',
      type: 'select',
      placeholder: 'Todos',
      options: TIPO_CLIENTE_OPTIONS,
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
      options: ESTADO_CLIENTE_OPTIONS,
      defaultValue: EstadoCliente.Activo,
    },
  ]);
}
