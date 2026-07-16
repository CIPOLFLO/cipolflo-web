export enum EstadoReserva {
  Pendiente = 'PENDIENTE',
  Confirmada = 'CONFIRMADA',
  EnCurso = 'EN_CURSO',
  Finalizada = 'FINALIZADA',
  Cancelada = 'CANCELADA',
  VencidaSinPago = 'VENCIDA_SIN_PAGO',
}

export const ESTADO_RESERVA_OPTIONS = [
  { label: 'Pendiente', value: EstadoReserva.Pendiente },
  { label: 'Confirmada', value: EstadoReserva.Confirmada },
  { label: 'En curso', value: EstadoReserva.EnCurso },
  { label: 'Finalizada', value: EstadoReserva.Finalizada },
  { label: 'Cancelada', value: EstadoReserva.Cancelada },
  { label: 'Vencida sin pago', value: EstadoReserva.VencidaSinPago },
];

export const ESTADO_RESERVA_LABEL: Record<EstadoReserva, string> = {
  [EstadoReserva.Pendiente]: 'Pendiente',
  [EstadoReserva.Confirmada]: 'Confirmada',
  [EstadoReserva.EnCurso]: 'En curso',
  [EstadoReserva.Finalizada]: 'Finalizada',
  [EstadoReserva.Cancelada]: 'Cancelada',
  [EstadoReserva.VencidaSinPago]: 'Vencida sin pago',
};

export const ESTADO_RESERVA_VALUE_CLASS: Partial<Record<EstadoReserva, 'success' | 'danger'>> = {
  [EstadoReserva.Confirmada]: 'success',
  [EstadoReserva.EnCurso]: 'success',
  [EstadoReserva.Cancelada]: 'danger',
  [EstadoReserva.VencidaSinPago]: 'danger',
};
