import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OccupancyCalendar } from './occupancy-calendar';
import { DateRangeSelection } from './occupancy-calendar.models';

describe('OccupancyCalendar', () => {
  let fixture: ComponentFixture<OccupancyCalendar>;
  let component: OccupancyCalendar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [OccupancyCalendar] }).compileComponents();
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
});
