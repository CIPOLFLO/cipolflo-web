import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { VerificationDialog } from './verification-dialog';

describe('VerificationDialog', () => {
  let fixture: ComponentFixture<VerificationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificationDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('title', 'Verificando finalización');
    fixture.componentRef.setInput('message', 'Revisando si la reserva #4 tiene saldo pendiente...');
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería mostrar el título y mensaje', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Verificando finalización');
    expect(text).toContain('Revisando si la reserva #4 tiene saldo pendiente...');
  });
});
