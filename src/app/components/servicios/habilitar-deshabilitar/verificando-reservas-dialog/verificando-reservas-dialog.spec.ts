import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { VerificandoReservasDialog } from './verificando-reservas-dialog';

describe('VerificandoReservasDialog', () => {
  let fixture: ComponentFixture<VerificandoReservasDialog>;
  let component: VerificandoReservasDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificandoReservasDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificandoReservasDialog);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('nombreServicio', 'Cabaña 1');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('visible es false por defecto', () => {
    const freshFixture = TestBed.createComponent(VerificandoReservasDialog);
    expect(freshFixture.componentInstance.visible()).toBe(false);
  });

  it('el input nombreServicio refleja el valor recibido', () => {
    expect(component.nombreServicio()).toBe('Cabaña 1');
  });
});
