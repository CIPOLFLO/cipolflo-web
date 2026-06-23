import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { DateRangeSelection, OccupiedRange } from './occupancy-calendar.models';
import { parseIsoDate, startOfToday, toDisplayDate, toIsoDate } from '../../utils/date.helper';

/**
 * Calendario de ocupación basado en PrimeNG. Permite seleccionar un rango de fechas y
 * deshabilita las fechas ocupadas (y las anteriores a hoy). El sombreado por color/estado
 * y el tooltip se abordan en un ticket aparte.
 */
@Component({
  selector: 'app-occupancy-calendar',
  standalone: true,
  imports: [FormsModule, DatePicker],
  templateUrl: './occupancy-calendar.html',
  styleUrl: './occupancy-calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OccupancyCalendar {
  readonly occupiedRanges = input<OccupiedRange[]>([]);
  readonly minDate = input<Date>(startOfToday());
  readonly initialRange = input<DateRangeSelection | null>(null);

  readonly rangeSelected = output<DateRangeSelection>();

  protected readonly selection = signal<Date[] | null>(null);

  constructor() {
    effect(
      () => {
        const range = this.initialRange();
        if (range?.inicio && range?.fin && this.selection() === null) {
          const inicio = parseIsoDate(range.inicio);
          const fin = parseIsoDate(range.fin);
          if (inicio && fin) this.selection.set([inicio, fin]);
        }
      },
      { allowSignalWrites: true },
    );
  }

  /** Días individuales deshabilitados, expandidos a partir de los rangos ocupados. */
  protected readonly disabledDates = computed<Date[]>(() => {
    const dias: Date[] = [];
    for (const rango of this.occupiedRanges()) {
      const cursor = parseIsoDate(rango.fechaInicio);
      const fin = parseIsoDate(rango.fechaFin);
      if (!cursor || !fin) continue;
      while (cursor <= fin) {
        dias.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return dias;
  });

  /** Etiqueta del período elegido para mostrarlo junto al calendario. */
  protected readonly rangoLabel = computed<string | null>(() => {
    const [inicio, fin] = this.selection() ?? [];
    if (!inicio) return null;
    return fin
      ? `${toDisplayDate(inicio)} — ${toDisplayDate(fin)}`
      : `Desde ${toDisplayDate(inicio)}…`;
  });

  protected onSelectionChange(value: Date[] | null): void {
    this.selection.set(value);
    const [inicio, fin] = value ?? [];
    this.rangeSelected.emit({ inicio: toIsoDate(inicio), fin: toIsoDate(fin) });
  }
}
