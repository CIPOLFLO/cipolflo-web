import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FilterConfigProvider, FormFieldConfig } from '../../../shared';
import { TIPO_MOVIMIENTO_OPTIONS } from '../models/finanza.model';
import { ConceptosService } from './conceptos.service';

@Injectable()
export class FinanzasFilterService extends FilterConfigProvider {
  private readonly conceptosService = inject(ConceptosService);
  private readonly destroyRef = inject(DestroyRef);

  readonly filterFields = signal<FormFieldConfig[]>([
    { key: 'fechaDesde', label: 'Fecha desde', type: 'date' },
    { key: 'fechaHasta', label: 'Fecha hasta', type: 'date' },
    {
      key: 'concepto',
      label: 'Concepto',
      type: 'select',
      placeholder: 'Todos',
      options: [],
    },
    {
      key: 'tipoMovimiento',
      label: 'Tipo de movimiento',
      type: 'select',
      placeholder: 'Todos',
      options: TIPO_MOVIMIENTO_OPTIONS,
    },
  ]);

  constructor() {
    super();
    this.conceptosService
      .getOpciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((opciones) => {
        this.filterFields.update((fields) =>
          fields.map((f) =>
            f.key === 'concepto'
              ? { ...f, options: [{ label: 'Todos', value: '' }, ...opciones] }
              : f,
          ),
        );
      });
  }
}
