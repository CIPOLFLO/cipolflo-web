import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Procedencia } from '../../../shared';
import { Concepto, FormaPago, TipoMovimiento } from '../models/finanza.model';
import { FinanzaService } from '../services/finanza.service';
import { NuevoMovimiento } from './nuevo-movimiento';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';

const FORM_VALIDO = {
  tipoMovimiento: TipoMovimiento.Ingreso,
  procedencia: Procedencia.Sede,
  concepto: Concepto.PagoReserva,
  fecha: '2026-01-15',
  importe: 500,
  formaPago: FormaPago.Efectivo,
};
const mockAuthService = {
  user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
  logout: vi.fn(),
};

const mockUserService = {
  userInitials: () => 'JP',
  userEmail: () => 'juan@example.com',
};

describe('NuevoMovimiento', () => {
  let component: NuevoMovimiento;
  let fixture: ComponentFixture<NuevoMovimiento>;
  let createSpy: ReturnType<typeof vi.fn>;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let handleSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    createSpy = vi.fn().mockReturnValue(of(undefined));
    navigateSpy = vi.fn();
    handleSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [NuevoMovimiento],
      providers: [
        { provide: FinanzaService, useValue: { create: createSpy } },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: ErrorHandlerService, useValue: { handle: handleSpy } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevoMovimiento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el título de la página', () => {
    expect(fixture.nativeElement.textContent).toContain('Nuevo Movimiento Financiero');
  });

  describe('confirmDisabled', () => {
    it('es true cuando el formulario es inválido (fecha e importe vacíos)', () => {
      expect(component['confirmDisabled']()).toBe(true);
    });

    it('es false cuando el formulario es válido', () => {
      component['form'].patchValue(FORM_VALIDO);
      fixture.detectChanges();
      expect(component['confirmDisabled']()).toBe(false);
    });

    it('es true cuando loading es true aunque el formulario sea válido', () => {
      component['form'].patchValue(FORM_VALIDO);
      component['loading'].set(true);
      fixture.detectChanges();
      expect(component['confirmDisabled']()).toBe(true);
    });
  });

  describe('onCancelar', () => {
    it('navega a /finanzas', () => {
      component['onCancelar']();
      expect(navigateSpy).toHaveBeenCalledWith(['/finanzas']);
    });
  });

  describe('onConfirmar', () => {
    it('no llama a create si el formulario es inválido', () => {
      component['onConfirmar']();
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('activa submitted al intentar confirmar', () => {
      component['onConfirmar']();
      expect(component['submitted']()).toBe(true);
    });

    it('llama a create con el DTO correcto cuando el formulario es válido', () => {
      component['form'].patchValue(FORM_VALIDO);
      component['onConfirmar']();
      expect(createSpy).toHaveBeenCalledWith({
        ...FORM_VALIDO,
        notas: null,
      });
    });

    it('navega a /finanzas tras crear exitosamente', () => {
      component['form'].patchValue(FORM_VALIDO);
      component['onConfirmar']();
      expect(navigateSpy).toHaveBeenCalledWith(['/finanzas']);
    });

    it('llama a errorHandler y no navega si create falla', () => {
      const error = new Error('Error del servidor');
      createSpy.mockReturnValue(throwError(() => error));
      component['form'].patchValue(FORM_VALIDO);
      component['onConfirmar']();
      expect(handleSpy).toHaveBeenCalledWith(error);
      expect(navigateSpy).not.toHaveBeenCalled();
    });

    it('resetea loading a false tras error', () => {
      createSpy.mockReturnValue(throwError(() => new Error()));
      component['form'].patchValue(FORM_VALIDO);
      component['onConfirmar']();
      expect(component['loading']()).toBe(false);
    });
  });
});
