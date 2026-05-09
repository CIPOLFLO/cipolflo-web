import { Injectable, signal } from '@angular/core';
import { FilterConfigProvider } from '../../../shared/services/filter-config.provider';
import { FormFieldConfig } from '../../../shared/models/form-field.model';
import { PROCEDENCIA_OPTIONS } from '../../../shared/models/procedencia.model';

@Injectable()
export class ReservasFilterService extends FilterConfigProvider {
  // Servicio de ejemplo de uso de servicio de filtros
  readonly filterFields = signal<FormFieldConfig[]>([
    {
      key: 'procedencia',
      label: 'Procedencia',
      type: 'select',
      placeholder: 'Seleccionar procedencia',
      options: PROCEDENCIA_OPTIONS,
    },
    {
      key: 'concepto',
      label: 'Concepto',
      type: 'select',
      placeholder: 'Seleccionar concepto',
      options: [],
    },
    {
      key: 'cliente',
      label: 'Cliente (Cédula)',
      type: 'text',
      placeholder: 'Buscar por cédula...',
    },
    {
      key: 'estado',
      label: 'Estado',
      type: 'select',
      placeholder: 'Seleccionar estado',
      options: [],
    },
    {
      key: 'fechaDesde',
      label: 'Fecha Desde',
      type: 'date',
    },
    {
      key: 'fechaHasta',
      label: 'Fecha Hasta',
      type: 'date',
    },
  ]);
}
