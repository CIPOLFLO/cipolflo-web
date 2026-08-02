import {
  EstadoReserva,
  ESTADO_RESERVA_LABEL,
  ESTADO_RESERVA_VALUE_CLASS,
  esReservaEditable,
} from './estado-reserva.model';

describe('ESTADO_RESERVA_LABEL', () => {
  it('debe contener una entrada por cada valor del enum EstadoReserva', () => {
    const valores = Object.values(EstadoReserva);
    valores.forEach((v) => {
      expect(ESTADO_RESERVA_LABEL[v]).toBeDefined();
    });
  });

  it('devuelve labels legibles para cada estado', () => {
    expect(ESTADO_RESERVA_LABEL[EstadoReserva.Pendiente]).toBe('Pendiente');
    expect(ESTADO_RESERVA_LABEL[EstadoReserva.Confirmada]).toBe('Confirmada');
    expect(ESTADO_RESERVA_LABEL[EstadoReserva.EnCurso]).toBe('En curso');
    expect(ESTADO_RESERVA_LABEL[EstadoReserva.Finalizada]).toBe('Finalizada');
    expect(ESTADO_RESERVA_LABEL[EstadoReserva.Cancelada]).toBe('Cancelada');
    expect(ESTADO_RESERVA_LABEL[EstadoReserva.VencidaSinPago]).toBe('Vencida sin pago');
  });
});

describe('ESTADO_RESERVA_VALUE_CLASS', () => {
  it('asigna success a Confirmada y EnCurso', () => {
    expect(ESTADO_RESERVA_VALUE_CLASS[EstadoReserva.Confirmada]).toBe('success');
    expect(ESTADO_RESERVA_VALUE_CLASS[EstadoReserva.EnCurso]).toBe('success');
  });

  it('asigna danger a Cancelada y VencidaSinPago', () => {
    expect(ESTADO_RESERVA_VALUE_CLASS[EstadoReserva.Cancelada]).toBe('danger');
    expect(ESTADO_RESERVA_VALUE_CLASS[EstadoReserva.VencidaSinPago]).toBe('danger');
  });

  it('no asigna clase a Pendiente ni Finalizada', () => {
    expect(ESTADO_RESERVA_VALUE_CLASS[EstadoReserva.Pendiente]).toBeUndefined();
    expect(ESTADO_RESERVA_VALUE_CLASS[EstadoReserva.Finalizada]).toBeUndefined();
  });
});

describe('esReservaEditable', () => {
  it('admite edición en Pendiente y Confirmada', () => {
    expect(esReservaEditable(EstadoReserva.Pendiente)).toBe(true);
    expect(esReservaEditable(EstadoReserva.Confirmada)).toBe(true);
  });

  it('rechaza los estados históricos o inmutables', () => {
    expect(esReservaEditable(EstadoReserva.EnCurso)).toBe(false);
    expect(esReservaEditable(EstadoReserva.Finalizada)).toBe(false);
    expect(esReservaEditable(EstadoReserva.Cancelada)).toBe(false);
    expect(esReservaEditable(EstadoReserva.VencidaSinPago)).toBe(false);
  });

  it('cubre todos los estados del enum', () => {
    Object.values(EstadoReserva).forEach((estado) => {
      expect(typeof esReservaEditable(estado)).toBe('boolean');
    });
  });
});
