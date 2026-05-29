import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReservasActivasDialog } from './reservas-activas-dialog';
import { ReservaProximaDto } from '../../models/servicio.model';
import { EstadoReserva } from '../../../../shared';

const reservaNoPaga: ReservaProximaDto = {
  id: 1,
  clienteId: 10,
  nombreCliente: 'Ana López',
  fechaEntrada: '2026-06-01T14:00:00Z',
  fechaSalida: '2026-06-03T12:00:00Z',
  pago: false,
  estado: EstadoReserva.Confirmada,
};

const reservaPaga: ReservaProximaDto = {
  id: 2,
  clienteId: 11,
  nombreCliente: 'Carlos Ruiz',
  fechaEntrada: '2026-06-10T14:00:00Z',
  fechaSalida: '2026-06-12T12:00:00Z',
  pago: true,
  estado: EstadoReserva.Pendiente,
};

const mockReservas = [reservaNoPaga, reservaPaga];

describe('ReservasActivasDialog', () => {
  let fixture: ComponentFixture<ReservasActivasDialog>;
  let component: ReservasActivasDialog;
  let mockRouter: {
    serializeUrl: ReturnType<typeof vi.fn>;
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockRouter = {
      serializeUrl: vi.fn().mockReturnValue('/reservas/1'),
      createUrlTree: vi.fn().mockReturnValue({}),
    };

    await TestBed.configureTestingModule({
      imports: [ReservasActivasDialog],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasActivasDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('reservas', mockReservas);
    fixture.componentRef.setInput('nombreServicio', 'Cabaña 1');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  describe('todasSeleccionadas', () => {
    it('es false cuando no hay ninguna seleccionada', () => {
      expect(component['todasSeleccionadas']()).toBe(false);
    });

    it('es true cuando todas las reservas están seleccionadas', () => {
      component['toggleTodas'](true);
      expect(component['todasSeleccionadas']()).toBe(true);
    });

    it('es false cuando solo algunas están seleccionadas', () => {
      component['toggleReserva'](1, true);
      expect(component['todasSeleccionadas']()).toBe(false);
    });
  });

  describe('tieneReservasPagas', () => {
    it('es true cuando alguna reserva de la lista es paga', () => {
      expect(component['tieneReservasPagas']()).toBe(true);
    });

    it('es false cuando ninguna reserva de la lista es paga', () => {
      fixture.componentRef.setInput('reservas', [reservaNoPaga]);
      fixture.detectChanges();
      expect(component['tieneReservasPagas']()).toBe(false);
    });
  });

  describe('hayPagasSeleccionadas', () => {
    it('es false cuando no hay ninguna seleccionada', () => {
      expect(component['hayPagasSeleccionadas']()).toBe(false);
    });

    it('es false cuando solo hay reservas no pagas seleccionadas', () => {
      component['toggleReserva'](reservaNoPaga.id, true);
      expect(component['hayPagasSeleccionadas']()).toBe(false);
    });

    it('es true cuando hay al menos una reserva paga seleccionada', () => {
      component['toggleReserva'](reservaPaga.id, true);
      expect(component['hayPagasSeleccionadas']()).toBe(true);
    });
  });

  describe('puedeDeshabilitarYCancelar', () => {
    it('es false cuando no hay ninguna seleccionada', () => {
      expect(component['puedeDeshabilitarYCancelar']()).toBe(false);
    });

    it('es true cuando hay seleccionadas y ninguna es paga', () => {
      component['toggleReserva'](reservaNoPaga.id, true);
      expect(component['puedeDeshabilitarYCancelar']()).toBe(true);
    });

    it('es false cuando hay al menos una reserva paga seleccionada', () => {
      component['toggleReserva'](reservaPaga.id, true);
      expect(component['puedeDeshabilitarYCancelar']()).toBe(false);
    });
  });

  describe('isSelected', () => {
    it('retorna false para un id no seleccionado', () => {
      expect(component['isSelected'](reservaNoPaga.id)).toBe(false);
    });

    it('retorna true para un id seleccionado', () => {
      component['toggleReserva'](reservaNoPaga.id, true);
      expect(component['isSelected'](reservaNoPaga.id)).toBe(true);
    });
  });

  describe('toggleReserva', () => {
    it('agrega el id al seleccionar', () => {
      component['toggleReserva'](reservaNoPaga.id, true);
      expect(component['seleccionadas']()).toContain(reservaNoPaga.id);
    });

    it('quita el id al deseleccionar', () => {
      component['toggleReserva'](reservaNoPaga.id, true);
      component['toggleReserva'](reservaNoPaga.id, false);
      expect(component['seleccionadas']()).not.toContain(reservaNoPaga.id);
    });

    it('no afecta otros ids al quitar uno', () => {
      component['toggleReserva'](reservaNoPaga.id, true);
      component['toggleReserva'](reservaPaga.id, true);
      component['toggleReserva'](reservaNoPaga.id, false);
      expect(component['seleccionadas']()).toEqual([reservaPaga.id]);
    });
  });

  describe('toggleTodas', () => {
    it('selecciona los ids de todas las reservas', () => {
      component['toggleTodas'](true);
      expect(component['seleccionadas']()).toEqual([reservaNoPaga.id, reservaPaga.id]);
    });

    it('vacía las seleccionadas cuando checked es false', () => {
      component['toggleTodas'](true);
      component['toggleTodas'](false);
      expect(component['seleccionadas']()).toEqual([]);
    });
  });

  describe('getReservaUrl', () => {
    it('llama a router.createUrlTree con la ruta correcta', () => {
      component['getReservaUrl'](5);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/reservas', 5]);
    });

    it('retorna el resultado de router.serializeUrl', () => {
      mockRouter.serializeUrl.mockReturnValue('/reservas/5');
      expect(component['getReservaUrl'](5)).toBe('/reservas/5');
    });
  });

  describe('onDeshabilitarYCancelar', () => {
    it('emite los ids seleccionados', () => {
      const emitidos: number[][] = [];
      component.deshabilitarYCancelar.subscribe((ids) => emitidos.push(ids));
      component['toggleReserva'](reservaNoPaga.id, true);
      component['onDeshabilitarYCancelar']();
      expect(emitidos[0]).toEqual([reservaNoPaga.id]);
    });

    it('emite una copia del array, no la referencia interna', () => {
      const emitidos: number[][] = [];
      component.deshabilitarYCancelar.subscribe((ids) => emitidos.push(ids));
      component['toggleReserva'](reservaNoPaga.id, true);
      component['onDeshabilitarYCancelar']();
      expect(emitidos[0]).not.toBe(component['seleccionadas']());
    });

    it('emite array vacío si no hay ninguna seleccionada', () => {
      const emitidos: number[][] = [];
      component.deshabilitarYCancelar.subscribe((ids) => emitidos.push(ids));
      component['onDeshabilitarYCancelar']();
      expect(emitidos[0]).toEqual([]);
    });
  });

  describe('outputs cancelar y deshabilitarSinCancelar', () => {
    it('cancelar emite al llamar emit()', () => {
      let emitido = false;
      component.cancelar.subscribe(() => (emitido = true));
      component.cancelar.emit();
      expect(emitido).toBe(true);
    });

    it('deshabilitarSinCancelar emite al llamar emit()', () => {
      let emitido = false;
      component.deshabilitarSinCancelar.subscribe(() => (emitido = true));
      component.deshabilitarSinCancelar.emit();
      expect(emitido).toBe(true);
    });
  });

  describe('efecto: reset de seleccionadas al cambiar el input reservas', () => {
    it('limpia las seleccionadas cuando cambia el input de reservas', () => {
      component['toggleTodas'](true);
      expect(component['seleccionadas']().length).toBe(2);

      fixture.componentRef.setInput('reservas', [reservaNoPaga]);
      TestBed.flushEffects();

      expect(component['seleccionadas']()).toEqual([]);
    });
  });
});
