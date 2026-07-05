import { Injectable, signal } from '@angular/core';
import { FilterConfigProvider, FormFieldConfig } from '../../../shared';
import { ESTADO_SOCIO_OPTIONS, TIPO_CLIENTE_OPTIONS } from '../models/cliente.model';

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
      key: 'identificador',
      label: 'Documento / Número de socio',
      type: 'text',
      placeholder: 'Buscar por documento o número de socio...',
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos',
      options: ESTADO_SOCIO_OPTIONS,
    },
  ]);
}
