export interface OccupiedRange {
  fechaInicio: string; // yyyy-MM-dd
  fechaFin: string; // yyyy-MM-dd
  estado?: string;
}

export interface DateRangeSelection {
  inicio: string | null;
  fin: string | null;
}
