import { describe, it, expect, beforeEach } from 'vitest';
import { ReservasColumnsService } from './reserva-columns.service';

describe('ReservasColumnsService', () => {
  let service: ReservasColumnsService;

  beforeEach(() => {
    service = new ReservasColumnsService();
  });

  it('expone 6 columnas', () => {
    expect(service.columns).toHaveLength(6);
  });

  it('las claves coinciden con los campos del DTO', () => {
    const keys = service.columns.map((c) => c.key);
    expect(keys).toEqual([
      'requiereAtencion',
      'nombreCliente',
      'servicioNombre',
      'fechaEntrada',
      'fechaSalida',
      'estadoReserva',
    ]);
  });

  it('nombreCliente, fechaEntrada y fechaSalida son ordenables', () => {
    const sortables = service.columns.filter((c) => c.sortable).map((c) => c.key);
    expect(sortables).toContain('nombreCliente');
    expect(sortables).toContain('fechaEntrada');
    expect(sortables).toContain('fechaSalida');
    expect(sortables).not.toContain('servicioNombre');
    expect(sortables).not.toContain('estadoReserva');
  });

  it('fechaEntrada y fechaSalida tienen cellType date', () => {
    const colDesde = service.columns.find((c) => c.key === 'fechaEntrada');
    const colHasta = service.columns.find((c) => c.key === 'fechaSalida');
    expect(colDesde?.cellType).toBe('date');
    expect(colHasta?.cellType).toBe('date');
  });

  describe('columna estadoReserva', () => {
    it('tiene cellType tag', () => {
      const col = service.columns.find((c) => c.key === 'estadoReserva');
      expect(col?.cellType).toBe('tag');
    });

    it('el tagMap cubre los 5 estados posibles', () => {
      const col = service.columns.find((c) => c.key === 'estadoReserva');
      if (!col || !('tagMap' in col)) throw new Error('columna estadoReserva no es de tipo tag');
      const keys = Object.keys(col.tagMap);
      expect(keys).toContain('CONFIRMADA');
      expect(keys).toContain('EN_CURSO');
      expect(keys).toContain('FINALIZADA');
      expect(keys).toContain('CANCELADA');
      expect(keys).toContain('PENDIENTE');
    });

    it('cada entrada del tagMap tiene styleClass y label', () => {
      const col = service.columns.find((c) => c.key === 'estadoReserva');
      if (!col || !('tagMap' in col)) throw new Error('columna estadoReserva no es de tipo tag');
      for (const entry of Object.values(col.tagMap)) {
        expect(entry.styleClass).toBeTruthy();
        expect(entry.label).toBeTruthy();
      }
    });
  });
});
