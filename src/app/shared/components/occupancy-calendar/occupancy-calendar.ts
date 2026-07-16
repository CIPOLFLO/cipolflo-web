import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePicker, DatePickerDateMeta } from 'primeng/datepicker';
import { Tooltip } from 'primeng/tooltip';
import { DateRangeSelection, DiaOcupado, OccupiedRange } from './occupancy-calendar.models';
import { parseIsoDate, startOfToday, toDisplayDate, toIsoDate } from '../../utils/date.helper';
import {
  EstadoReserva,
  ESTADO_RESERVA_LABEL,
  ESTADO_RESERVA_TAG_CLASS,
} from '../../models/estado-reserva.model';

/**
 * Calendario de ocupación basado en PrimeNG. Permite seleccionar un rango de fechas y
 * deshabilita las fechas ocupadas (y las anteriores a hoy), sin permitir un rango que
 * atraviese un bloqueo. Los días ocupados se colorean según el estado de la reserva que los
 * ocupa, con link al detalle y una leyenda de colores.
 */
@Component({
  selector: 'app-occupancy-calendar',
  standalone: true,
  imports: [FormsModule, DatePicker, Tooltip],
  templateUrl: './occupancy-calendar.html',
  styleUrl: './occupancy-calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OccupancyCalendar {
  private readonly router = inject(Router);

  readonly occupiedRanges = input<OccupiedRange[]>([]);
  readonly minDate = input<Date>(startOfToday());
  readonly initialRange = input<DateRangeSelection | null>(null);
  readonly readOnly = input<boolean>(false);

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

  /**
   * Tope dinámico una vez elegido el inicio del rango: el día anterior al próximo bloqueo
   * futuro. Evita que se pueda seleccionar un fin que atraviese un rango ocupado (PrimeNG en
   * modo range sólo impide clickear directamente un día deshabilitado, no un rango que lo
   * atraviesa). Sin inicio elegido, o con el rango ya completo, no hay tope.
   */
  protected readonly maxDate = computed<Date | undefined>(() => {
    const [inicio, fin] = this.selection() ?? [];
    if (!inicio || fin) return undefined;

    let proximoBloqueo: Date | null = null;
    for (const rango of this.occupiedRanges()) {
      const inicioBloqueo = parseIsoDate(rango.fechaInicio);
      if (!inicioBloqueo || inicioBloqueo <= inicio) continue;
      if (!proximoBloqueo || inicioBloqueo < proximoBloqueo) proximoBloqueo = inicioBloqueo;
    }
    if (!proximoBloqueo) return undefined;

    const limite = new Date(proximoBloqueo);
    limite.setDate(limite.getDate() - 1);
    return limite;
  });

  /** Etiqueta del período elegido para mostrarlo junto al calendario. */
  protected readonly rangoLabel = computed<string | null>(() => {
    const [inicio, fin] = this.selection() ?? [];
    if (!inicio) return null;
    if (!fin) return `Desde ${toDisplayDate(inicio)}…`;
    return toIsoDate(inicio) === toIsoDate(fin)
      ? toDisplayDate(inicio)
      : `${toDisplayDate(inicio)} — ${toDisplayDate(fin)}`;
  });

  protected readonly esFechaUnica = computed<boolean>(() => {
    const [inicio, fin] = this.selection() ?? [];
    if (!inicio || !fin) return false;
    return toIsoDate(inicio) === toIsoDate(fin);
  });

  protected onSelectionChange(value: Date[] | null): void {
    this.selection.set(value);
    const [inicio, fin] = value ?? [];
    this.rangeSelected.emit({ inicio: toIsoDate(inicio), fin: toIsoDate(fin) });
  }

  /** Reserva (id + estado) que ocupa cada día, expandida a partir de los rangos ocupados. */
  protected readonly ocupacionPorFecha = computed<Map<string, DiaOcupado>>(() => {
    const mapa = new Map<string, DiaOcupado>();
    for (const rango of this.occupiedRanges()) {
      const cursor = parseIsoDate(rango.fechaInicio);
      const fin = parseIsoDate(rango.fechaFin);
      if (!cursor || !fin) continue;
      while (cursor <= fin) {
        const iso = toIsoDate(cursor);
        if (iso) mapa.set(iso, { reservaId: rango.reservaId, estado: rango.estado });
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return mapa;
  });

  /** Estados presentes en los rangos ocupados actuales, para la leyenda de colores. */
  protected readonly estadosEnLeyenda = computed<EstadoReserva[]>(() => {
    const presentes = new Set(
      this.occupiedRanges()
        .map((rango) => rango.estado)
        .filter((estado): estado is EstadoReserva => !!estado),
    );
    return Array.from(presentes);
  });

  /** Rango ocupado con la fecha de inicio más temprana, para destacar la próxima reserva. */
  protected readonly proximaReserva = computed<OccupiedRange | null>(() => {
    return this.occupiedRanges().reduce<OccupiedRange | null>((proxima, rango) => {
      const fechaRango = parseIsoDate(rango.fechaInicio);
      const fechaProxima = proxima ? parseIsoDate(proxima.fechaInicio) : null;
      if (!fechaRango) return proxima;
      if (!fechaProxima || fechaRango < fechaProxima) return rango;
      return proxima;
    }, null);
  });

  protected fechaIsoDeMeta(meta: DatePickerDateMeta): string | null {
    return toIsoDate(new Date(meta.year, meta.month, meta.day));
  }

  /**
   * Reserva que ocupa el día representado por una celda del datepicker (o `undefined` si el
   * día no es seleccionable por otro motivo: pasado, o capado por `maxDate`).
   */
  protected diaOcupado(meta: DatePickerDateMeta): DiaOcupado | undefined {
    const iso = this.fechaIsoDeMeta(meta);
    return iso ? this.ocupacionPorFecha().get(iso) : undefined;
  }

  /** Evita que el click en el día burbujee al datepicker: en un día ocupado cancelaría la
   *  navegación del link (PrimeNG llama preventDefault() sobre días no seleccionables); en un
   *  día disponible en modo readOnly evita que dispare la selección de rango. */
  protected onDiaClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  protected getReservaUrl(reservaId: number): string {
    return this.router.serializeUrl(this.router.createUrlTree(['/reservas', reservaId]));
  }

  protected tagClassFor(estado: EstadoReserva | undefined): string {
    return estado ? ESTADO_RESERVA_TAG_CLASS[estado] : '';
  }

  protected estadoLabelFor(estado: EstadoReserva | undefined): string {
    return estado ? ESTADO_RESERVA_LABEL[estado] : '';
  }

  protected tooltipTextoFor(ocupado: DiaOcupado): string {
    return `Ver reserva #${ocupado.reservaId}`;
  }

  protected isoADisplay(iso: string): string {
    return toDisplayDate(parseIsoDate(iso));
  }
}
