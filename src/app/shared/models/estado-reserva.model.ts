export enum EstadoReserva {
  Pendiente = 'PENDIENTE',
  Confirmada = 'CONFIRMADA',
  EnCurso = 'EN_CURSO',
  Finalizada = 'FINALIZADA',
  Cancelada = 'CANCELADA',
}

export const ESTADO_RESERVA_LABEL: Record<EstadoReserva, string> = {
  [EstadoReserva.Pendiente]: 'Pendiente',
  [EstadoReserva.Confirmada]: 'Confirmada',
  [EstadoReserva.EnCurso]: 'En curso',
  [EstadoReserva.Finalizada]: 'Finalizada',
  [EstadoReserva.Cancelada]: 'Cancelada',
};

export const ESTADO_RESERVA_VALUE_CLASS: Partial<Record<EstadoReserva, 'success' | 'danger'>> = {
  [EstadoReserva.Confirmada]: 'success',
  [EstadoReserva.EnCurso]: 'success',
  [EstadoReserva.Cancelada]: 'danger',
};
