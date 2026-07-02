import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificandoCancelacionDialog } from './verificando-cancelacion-dialog';

describe('VerificandoCancelacionDialog', () => {
  let component: VerificandoCancelacionDialog;
  let fixture: ComponentFixture<VerificandoCancelacionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificandoCancelacionDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(VerificandoCancelacionDialog);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el número de reserva cuando está visible', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('numeroReserva', 42);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('42');
    expect(fixture.nativeElement.textContent).toContain('pagos asociados');
  });
});
