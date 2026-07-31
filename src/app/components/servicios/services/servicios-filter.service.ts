import { Injectable, signal } from '@angular/core';
import {
  FilterConfigProvider,
  FormFieldConfig,
  Procedencia,
  PROCEDENCIA_OPTIONS,
} from '../../../shared';
import { ESTADO_SERVICIO_OPTIONS, EstadoServicio } from '../models/servicio.model';

@Injectable()
export class ServiciosFilterService extends FilterConfigProvider {
  readonly filterFields = signal<FormFieldConfig[]>([
    {
      key: 'procedencia',
      label: 'Procedencia',
      type: 'select',
      placeholder: 'Seleccionar procedencia',
      // Un servicio pertenece a una sola sede: "Ambos" no es una procedencia válida para
      // filtrar servicios (mismo criterio que servicio-options.service.ts para el alta).
      options: [
        { label: 'Todos', value: '' },
        ...PROCEDENCIA_OPTIONS.filter((option) => option.value !== Procedencia.Ambos),
      ],
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
      defaultValue: EstadoServicio.Habilitado,
    },
  ]);
}
