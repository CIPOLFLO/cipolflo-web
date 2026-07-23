import { EstadoReserva } from '../../models/estado-reserva.model';

export interface OccupiedRange {
  fechaInicio: string; // yyyy-MM-dd
  fechaFin: string; // yyyy-MM-dd
  estado?: EstadoReserva;
  reservaId?: number;
}

export interface DateRangeSelection {
  inicio: string | null;
  fin: string | null;
}

/** Reserva que ocupa un día puntual del calendario (resuelta a partir de los `OccupiedRange`). */
export interface DiaOcupado {
  reservaId?: number;
  estado?: EstadoReserva;
}
