import { Injectable, signal } from '@angular/core';
import { FilterConfigProvider, FormFieldConfig, PROCEDENCIA_OPTIONS } from '../../../shared';
import { ESTADO_SERVICIO_OPTIONS } from '../models/servicio.model';

@Injectable()
export class ServiciosFilterService extends FilterConfigProvider {
  readonly filterFields = signal<FormFieldConfig[]>([
    {
      key: 'procedencia',
      label: 'Procedencia',
      type: 'select',
      placeholder: 'Seleccionar procedencia',
      options: PROCEDENCIA_OPTIONS,
    },
    {
      key: 'nombre',
      label: 'Nombre del Servicio',
      type: 'text',
      placeholder: 'Buscar por nombre...',
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select',
      placeholder: 'Seleccionar estado',
      options: ESTADO_SERVICIO_OPTIONS,
    },
  ]);
}
