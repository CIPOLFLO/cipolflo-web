import { Injectable } from '@angular/core';
import { ColumnConfig } from '../../../shared';
import { CONCEPTO_LABEL, Concepto } from '../models/finanza.model';

@Injectable()
export class FinanzasColumnsService {
  readonly columns: ColumnConfig[] = [
    { key: 'importeSignado', label: 'Importe', cellType: 'amount', sortable: true },
    {
      key: 'concepto',
      label: 'Concepto',
      transform: (v) => CONCEPTO_LABEL[v as Concepto] ?? v,
    },
    { key: 'fecha', label: 'Fecha', sortable: true },
    { key: 'descripcion', label: 'Descripción', nullFallback: '—' },
  ];
}
