import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OccupancyCalendar } from './occupancy-calendar';
import { DateRangeSelection } from './occupancy-calendar.models';
import { toIsoDate } from '../../utils/date.helper';
import { EstadoReserva } from '../../models/estado-reserva.model';

describe('OccupancyCalendar', () => {
  let fixture: ComponentFixture<OccupancyCalendar>;
  let component: OccupancyCalendar;
  let mockRouter: {
    serializeUrl: ReturnType<typeof vi.fn>;
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockRouter = {
      serializeUrl: vi.fn().mockReturnValue('/reservas/21'),
      createUrlTree: vi.fn().mockReturnValue({}),
    };

    await TestBed.configureTestingModule({
      imports: [OccupancyCalendar],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();
    fixture = TestBed.createComponent(OccupancyCalendar);
    component = fixture.componentInstance;
  });

  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('expande los rangos ocupados a días individuales (extremos inclusive)', () => {
    fixture.componentRef.setInput('occupiedRanges', [
      { fechaInicio: '2026-06-10', fechaFin: '2026-06-12' },
    ]);
    fixture.detectChanges();
    const dias = component['disabledDates']();
    expect(dias.length).toBe(3);
    expect(dias[0].getDate()).toBe(10);
    expect(dias[2].getDate()).toBe(12);
  });

  it('emite el rango seleccionado en formato yyyy-MM-dd', () => {
    const emitido: DateRangeSelection[] = [];
    component.rangeSelected.subscribe((r) => emitido.push(r));
    component['onSelectionChange']([new Date(2026, 6, 1), new Date(2026, 6, 3)]);
    expect(emitido[0]).toEqual({ inicio: '2026-07-01', fin: '2026-07-03' });
  });

  it('emite fin nulo cuando sólo se eligió la fecha de inicio', () => {
    const spy = vi.fn();
    component.rangeSelected.subscribe(spy);
    component['onSelectionChange']([new Date(2026, 6, 1)]);
    expect(spy).toHaveBeenCalledWith({ inicio: '2026-07-01', fin: null });
  });

  it('pre-selecciona el rango cuando se pasa initialRange con fechas válidas', () => {
    fixture.componentRef.setInput('initialRange', { inicio: '2026-08-10', fin: '2026-08-15' });
    fixture.detectChanges();
    const sel = component['selection']();
    expect(sel).not.toBeNull();
    expect(sel![0].getDate()).toBe(10);
    expect(sel![0].getMonth()).toBe(7); // agosto = índice 7
    expect(sel![1].getDate()).toBe(15);
  });

  it('rangoLabel muestra la fecha sola cuando inicio y fin coinciden', () => {
    component['onSelectionChange']([new Date(2026, 6, 1), new Date(2026, 6, 1)]);
    expect(component['rangoLabel']()).toBe('01/07/2026');
  });

  it('esFechaUnica es true cuando inicio y fin son el mismo día', () => {
    component['onSelectionChange']([new Date(2026, 6, 1), new Date(2026, 6, 1)]);
    expect(component['esFechaUnica']()).toBe(true);
  });

  it('rangoLabel muestra el rango cuando inicio y fin son distintos', () => {
    component['onSelectionChange']([new Date(2026, 6, 1), new Date(2026, 6, 3)]);
    expect(component['rangoLabel']()).toBe('01/07/2026 — 03/07/2026');
  });

  it('esFechaUnica es false cuando inicio y fin son días distintos', () => {
    component['onSelectionChange']([new Date(2026, 6, 1), new Date(2026, 6, 3)]);
    expect(component['esFechaUnica']()).toBe(false);
  });

  it('rangoLabel muestra "Desde…" cuando sólo hay fecha de inicio', () => {
    component['onSelectionChange']([new Date(2026, 6, 1)]);
    expect(component['rangoLabel']()).toBe('Desde 01/07/2026…');
  });

  describe('maxDate', () => {
    it('es undefined sin fecha de inicio elegida', () => {
      expect(component['maxDate']()).toBeUndefined();
    });

    it('es undefined con inicio elegido y sin bloqueos posteriores', () => {
      component['onSelectionChange']([new Date(2026, 6, 5)]);
      expect(component['maxDate']()).toBeUndefined();
    });

    it('capa al día anterior al próximo bloqueo posterior al inicio', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        { fechaInicio: '2026-07-10', fechaFin: '2026-07-12' },
      ]);
      fixture.detectChanges();
      component['onSelectionChange']([new Date(2026, 6, 5)]);
      const max = component['maxDate']();
      expect(max).toBeDefined();
      expect(toIsoDate(max!)).toBe('2026-07-09');
    });

    it('con rangos ocupados consecutivos, capa al primero de ellos', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        { fechaInicio: '2026-07-10', fechaFin: '2026-07-12' },
        { fechaInicio: '2026-07-13', fechaFin: '2026-07-15' },
      ]);
      fixture.detectChanges();
      component['onSelectionChange']([new Date(2026, 6, 5)]);
      expect(toIsoDate(component['maxDate']()!)).toBe('2026-07-09');
    });

    it('con un gap entre rangos ocupados, permite seleccionar hasta el día previo al siguiente bloqueo', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        { fechaInicio: '2026-07-10', fechaFin: '2026-07-12' },
        { fechaInicio: '2026-07-16', fechaFin: '2026-07-18' },
      ]);
      fixture.detectChanges();
      component['onSelectionChange']([new Date(2026, 6, 13)]);
      expect(toIsoDate(component['maxDate']()!)).toBe('2026-07-15');
    });

    it('es undefined cuando el rango ya está completo (inicio y fin elegidos)', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        { fechaInicio: '2026-07-10', fechaFin: '2026-07-12' },
      ]);
      fixture.detectChanges();
      component['onSelectionChange']([new Date(2026, 6, 5), new Date(2026, 6, 8)]);
      expect(component['maxDate']()).toBeUndefined();
    });

    it('ignora bloqueos que empiezan antes o el mismo día del inicio elegido', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        { fechaInicio: '2026-07-01', fechaFin: '2026-07-05' },
      ]);
      fixture.detectChanges();
      component['onSelectionChange']([new Date(2026, 6, 5)]);
      expect(component['maxDate']()).toBeUndefined();
    });
  });

  describe('ocupacionPorFecha', () => {
    it('expande cada rango a sus días individuales con reservaId y estado', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        {
          fechaInicio: '2026-07-10',
          fechaFin: '2026-07-12',
          reservaId: 21,
          estado: EstadoReserva.Confirmada,
        },
      ]);
      fixture.detectChanges();
      const mapa = component['ocupacionPorFecha']();
      expect(mapa.size).toBe(3);
      expect(mapa.get('2026-07-10')).toEqual({ reservaId: 21, estado: EstadoReserva.Confirmada });
      expect(mapa.get('2026-07-12')).toEqual({ reservaId: 21, estado: EstadoReserva.Confirmada });
    });

    it('no incluye días fuera de ningún rango', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        {
          fechaInicio: '2026-07-10',
          fechaFin: '2026-07-10',
          reservaId: 21,
          estado: EstadoReserva.Confirmada,
        },
      ]);
      fixture.detectChanges();
      expect(component['ocupacionPorFecha']().has('2026-07-11')).toBe(false);
    });

    it('conviven varios rangos con distinto estado', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        {
          fechaInicio: '2026-07-10',
          fechaFin: '2026-07-10',
          reservaId: 21,
          estado: EstadoReserva.Confirmada,
        },
        {
          fechaInicio: '2026-07-20',
          fechaFin: '2026-07-20',
          reservaId: 22,
          estado: EstadoReserva.Cancelada,
        },
      ]);
      fixture.detectChanges();
      const mapa = component['ocupacionPorFecha']();
      expect(mapa.get('2026-07-10')?.estado).toBe(EstadoReserva.Confirmada);
      expect(mapa.get('2026-07-20')?.estado).toBe(EstadoReserva.Cancelada);
    });
  });

  describe('estadosEnLeyenda', () => {
    it('sólo incluye los estados presentes en occupiedRanges, sin duplicados', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        {
          fechaInicio: '2026-07-10',
          fechaFin: '2026-07-10',
          reservaId: 21,
          estado: EstadoReserva.Confirmada,
        },
        {
          fechaInicio: '2026-07-15',
          fechaFin: '2026-07-15',
          reservaId: 22,
          estado: EstadoReserva.Confirmada,
        },
        {
          fechaInicio: '2026-07-20',
          fechaFin: '2026-07-20',
          reservaId: 23,
          estado: EstadoReserva.Cancelada,
        },
      ]);
      fixture.detectChanges();
      expect(component['estadosEnLeyenda']()).toEqual([
        EstadoReserva.Confirmada,
        EstadoReserva.Cancelada,
      ]);
    });

    it('es un array vacío sin rangos ocupados', () => {
      expect(component['estadosEnLeyenda']()).toEqual([]);
    });
  });

  describe('diaOcupado', () => {
    it('devuelve la reserva del día cuando cae dentro de un rango ocupado', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        {
          fechaInicio: '2026-07-10',
          fechaFin: '2026-07-12',
          reservaId: 21,
          estado: EstadoReserva.Confirmada,
        },
      ]);
      fixture.detectChanges();
      const ocupado = component['diaOcupado']({ day: 11, month: 6, year: 2026 });
      expect(ocupado).toEqual({ reservaId: 21, estado: EstadoReserva.Confirmada });
    });

    it('devuelve undefined para un día que no está ocupado (pasado o capado por maxDate)', () => {
      fixture.componentRef.setInput('occupiedRanges', [
        {
          fechaInicio: '2026-07-10',
          fechaFin: '2026-07-12',
          reservaId: 21,
          estado: EstadoReserva.Confirmada,
        },
      ]);
      fixture.detectChanges();
      expect(component['diaOcupado']({ day: 5, month: 6, year: 2026 })).toBeUndefined();
    });
  });

  describe('fechaIsoDeMeta', () => {
    it('formatea con padding meses y días de un dígito', () => {
      expect(component['fechaIsoDeMeta']({ day: 5, month: 0, year: 2026 })).toBe('2026-01-05');
    });
  });

  describe('tagClassFor / estadoLabelFor', () => {
    it('devuelve la clase de color correcta para cada estado', () => {
      expect(component['tagClassFor'](EstadoReserva.Pendiente)).toBe('tag--yellow');
      expect(component['tagClassFor'](EstadoReserva.Confirmada)).toBe('tag--green');
      expect(component['tagClassFor'](EstadoReserva.EnCurso)).toBe('tag--blue');
      expect(component['tagClassFor'](EstadoReserva.Finalizada)).toBe('tag--purple');
      expect(component['tagClassFor'](EstadoReserva.Cancelada)).toBe('tag--gray');
      expect(component['tagClassFor'](EstadoReserva.VencidaSinPago)).toBe('tag--red');
    });

    it('devuelve string vacío cuando el estado es undefined', () => {
      expect(component['tagClassFor'](undefined)).toBe('');
      expect(component['estadoLabelFor'](undefined)).toBe('');
    });

    it('devuelve la etiqueta legible del estado', () => {
      expect(component['estadoLabelFor'](EstadoReserva.EnCurso)).toBe('En curso');
    });
  });

  describe('tooltipTextoFor', () => {
    it('arma el texto del tooltip con el id de la reserva, sin mencionar el estado', () => {
      const texto = component['tooltipTextoFor']({
        reservaId: 21,
        estado: EstadoReserva.Confirmada,
      });
      expect(texto).toBe('Ver reserva #21');
    });
  });

  describe('onDiaOcupadoClick', () => {
    it('detiene la propagación del evento para no cancelar la navegación del link', () => {
      const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;
      component['onDiaOcupadoClick'](event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('getReservaUrl', () => {
    it('delega en Router.createUrlTree/serializeUrl con la ruta de detalle', () => {
      const url = component['getReservaUrl'](21);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/reservas', 21]);
      expect(url).toBe('/reservas/21');
    });
  });
});
