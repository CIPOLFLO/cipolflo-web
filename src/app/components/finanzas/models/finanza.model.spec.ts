import { Concepto, getConceptoOptionsByTipoMovimiento, TipoMovimiento } from './finanza.model';

describe('finanza.model', () => {
  it('deberia retornar conceptos de ingreso', () => {
    const options = getConceptoOptionsByTipoMovimiento(TipoMovimiento.Ingreso);

    expect(options).toEqual([
      { label: 'Pago de reserva', value: Concepto.PagoReserva },
      { label: 'OTRO', value: Concepto.Otro },
    ]);
  });

  it('deberia retornar conceptos de egreso', () => {
    const options = getConceptoOptionsByTipoMovimiento(TipoMovimiento.Egreso);

    expect(options).toEqual([
      { label: 'UTE', value: Concepto.Ute },
      { label: 'ANTEL', value: Concepto.Antel },
      { label: 'OSE', value: Concepto.Ose },
      { label: 'Barraca', value: Concepto.Barraca },
      { label: 'OTRO', value: Concepto.Otro },
    ]);
  });

  it('deberia retornar todos los conceptos cuando no hay tipo de movimiento', () => {
    const options = getConceptoOptionsByTipoMovimiento(null);

    expect(options.map((option) => option.value)).toEqual(Object.values(Concepto));
  });
});
