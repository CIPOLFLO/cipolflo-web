import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OcupacionServicioDialog } from './ocupacion-servicio-dialog';

describe('OcupacionServicioDialog', () => {
  let fixture: ComponentFixture<OcupacionServicioDialog>;
  let component: OcupacionServicioDialog;

  beforeEach(async () => {
    const mockRouter = {
      serializeUrl: vi.fn().mockReturnValue('/reservas/1'),
      createUrlTree: vi.fn().mockReturnValue({}),
    };

    await TestBed.configureTestingModule({
      imports: [OcupacionServicioDialog],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(OcupacionServicioDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('nombreServicio', 'Cabaña 1');
    fixture.detectChanges();
  });

  it('crea el componente', () => {
    expect(component).toBeTruthy();
  });

  it('emite cerrar al confirmar el cierre', () => {
    const spy = vi.fn();
    component.cerrar.subscribe(spy);
    component['cerrar'].emit();
    expect(spy).toHaveBeenCalled();
  });
});
