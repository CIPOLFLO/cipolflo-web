import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { VerificandoFinalizacionDialog } from './verificando-finalizacion-dialog';

describe('VerificandoFinalizacionDialog', () => {
  let fixture: ComponentFixture<VerificandoFinalizacionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificandoFinalizacionDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificandoFinalizacionDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('numeroReserva', 12);
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería mostrar el texto de verificación', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Verificando finalización');
    expect(text).toContain('Estamos revisando si la reserva tiene saldo pendiente.');
  });
});
