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
  describe('precarga desde factura analizada', () => {
    it('debería precargar el formulario si viene una factura analizada en history.state', () => {
      vi.spyOn(history, 'state', 'get').mockReturnValue({
        facturaAnalizada: {
          tipoMovimiento: TipoMovimiento.Egreso,
          procedencia: Procedencia.Ambos,
          concepto: Concepto.Ute,
          fecha: '2026-06-25',
          importe: 3203,
          formaPago: FormaPago.Efectivo,
          notas: 'Factura cargada',
        },
      });

      fixture = TestBed.createComponent(NuevoMovimiento);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['form'].get('concepto')?.value).toBe(Concepto.Ute);
      expect(component['form'].get('importe')?.value).toBe(3203);
      expect(component['form'].get('notas')?.value).toBe('Factura cargada');
    });

    it('no debería precargar el formulario si no viene factura analizada en history.state', () => {
      vi.spyOn(history, 'state', 'get').mockReturnValue({});

      fixture = TestBed.createComponent(NuevoMovimiento);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component['form'].get('concepto')?.value).toBe(Concepto.PagoReserva);
      expect(component['form'].get('importe')?.value).toBeNull();
      expect(component['form'].get('notas')?.value).toBeNull();
    });
  });
  describe('FinanzaFormBase', () => {
    it('onMovimientoChange debería cambiar a OTRO si el concepto actual no corresponde al tipo de movimiento', () => {
      component['form'].patchValue({
        tipoMovimiento: TipoMovimiento.Ingreso,
        concepto: Concepto.PagoReserva,
      });

      component['onMovimientoChange']({
        tipoMovimiento: TipoMovimiento.Egreso,
      });

      expect(component['form'].get('tipoMovimiento')?.value).toBe(TipoMovimiento.Egreso);
      expect(component['form'].get('concepto')?.value).toBe(Concepto.Otro);
    });

    it('onMovimientoChange debería mantener el concepto si sigue siendo válido', () => {
      component['form'].patchValue({
        tipoMovimiento: TipoMovimiento.Egreso,
        concepto: Concepto.Ute,
      });

      component['onMovimientoChange']({
        tipoMovimiento: TipoMovimiento.Egreso,
      });

      expect(component['form'].get('concepto')?.value).toBe(Concepto.Ute);
    });

    it('onInfoChange debería actualizar los campos de información', () => {
      component['onInfoChange']({
        procedencia: Procedencia.Sede,
        concepto: Concepto.Otro,
        fecha: '2026-06-25',
        importe: '1234',
        formaPago: FormaPago.Efectivo,
      });

      expect(component['form'].get('procedencia')?.value).toBe(Procedencia.Sede);
      expect(component['form'].get('concepto')?.value).toBe(Concepto.Otro);
      expect(component['form'].get('fecha')?.value).toBe('2026-06-25');
      expect(component['form'].get('importe')?.value).toBe(1234);
      expect(component['form'].get('formaPago')?.value).toBe(FormaPago.Efectivo);
    });

    it('onInfoChange debería setear importe null si el valor no es numérico', () => {
      component['onInfoChange']({
        procedencia: Procedencia.Sede,
        concepto: Concepto.Otro,
        fecha: '2026-06-25',
        importe: 'abc',
        formaPago: FormaPago.Efectivo,
      });

      expect(component['form'].get('importe')?.value).toBeNull();
    });

    it('onAdicionalChange debería actualizar notas', () => {
      component['onAdicionalChange']({
        notas: 'Observación de prueba',
      });

      expect(component['form'].get('notas')?.value).toBe('Observación de prueba');
    });

    it('onFieldBlur debería marcar el campo como touched', () => {
      component['onFieldBlur']('fecha');

      expect(component['form'].get('fecha')?.touched).toBe(true);
    });
  });
});
