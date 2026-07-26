import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NuevoServicio } from './nuevo-servicio';
import { ServicioService } from '../services/servicio.service';
import { ServicioOptionsService } from '../services/servicio-options.service';
import { EstadoServicio, TipoClienteTarifa } from '../models/servicio.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';

const mockAuthService = {
  user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
  logout: vi.fn(),
};

const mockUserService = {
  userInitials: () => 'JP',
  userEmail: () => 'juan@example.com',
};

describe('NuevoServicio', () => {
  let fixture: ComponentFixture<NuevoServicio>;
  let component: NuevoServicio;
  let mockServicioService: { create: ReturnType<typeof vi.fn> };
  let mockOptionsService: {
    getProcedencias: ReturnType<typeof vi.fn>;
    getModalidades: ReturnType<typeof vi.fn>;
  };
  let navigateSpy: ReturnType<typeof vi.fn>;
  let mockErrorHandler: {
    handle: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockServicioService = { create: vi.fn() };
    mockOptionsService = {
      getProcedencias: vi.fn().mockReturnValue(of([])),
      getModalidades: vi.fn().mockReturnValue(of([])),
    };
    navigateSpy = vi.fn();
    mockErrorHandler = { handle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [NuevoServicio],
      providers: [
        { provide: ServicioService, useValue: mockServicioService },
        { provide: ServicioOptionsService, useValue: mockOptionsService },
        { provide: Router, useValue: { navigate: navigateSpy } },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevoServicio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidForm(): void {
    component['form'].patchValue({
      procedencia: 'CAMPING',
      nombre: 'Test servicio',
    });
    // El constructor ya precarga una fila Particular (índice 0) y una Socio Común (índice 1).
    component['tarifas'].at(0).patchValue({
      tipoCliente: TipoClienteTarifa.Particular,
      precio: 100,
      modalidadPrecio: 'POR_DIA',
      antiguedadMinima: null,
      antiguedadMaxima: null,
    });
    component['tarifas'].at(1).patchValue({
      tipoCliente: TipoClienteTarifa.SocioComun,
      precio: 80,
      modalidadPrecio: 'POR_DIA',
    });
  }

  // ── Creación y estado inicial ────────────────────────────────────────────

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('confirmDisabled debería ser true con el formulario vacío', () => {
    expect(component['confirmDisabled']()).toBe(true);
  });

  it('confirmDisabled debería ser false cuando el formulario es válido', () => {
    fillValidForm();
    fixture.detectChanges();
    expect(component['confirmDisabled']()).toBe(false);
  });

  it('infoErrors debería estar vacío cuando submitted es false', () => {
    expect(component['infoErrors']()).toEqual({});
  });

  it('preciosErrors debería estar vacío cuando submitted es false', () => {
    expect(component['preciosErrors']()).toEqual({});
  });

  // ── Tarifas ──────────────────────────────────────────────────────────────

  it('precarga dos filas fijas: Particular y Socio Común', () => {
    expect(component['tarifas'].length).toBe(2);
    expect(component['tarifas'].at(0).controls.tipoCliente.value).toBe(
      TipoClienteTarifa.Particular,
    );
    expect(component['tarifas'].at(0).controls.fija.value).toBe(true);
    expect(component['tarifas'].at(1).controls.tipoCliente.value).toBe(
      TipoClienteTarifa.SocioComun,
    );
    expect(component['tarifas'].at(1).controls.fija.value).toBe(true);
  });

  it('agregarTarifa debería agregar una fila nueva (no fija) al final', () => {
    component['agregarTarifa']();
    expect(component['tarifas'].length).toBe(3);
    expect(component['tarifas'].at(2).controls.fija.value).toBe(false);
  });

  it('quitarTarifa debería quitar la fila en el índice indicado', () => {
    component['agregarTarifa']();
    component['tarifas'].at(2).controls.tipoCliente.setValue(TipoClienteTarifa.SocioPolicia);

    component['quitarTarifa'](2);

    expect(component['tarifas'].length).toBe(2);
  });

  // ── Errores tras submit ──────────────────────────────────────────────────

  it('infoErrors[procedencia] debería mostrar error cuando submitted y campo vacío', () => {
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['procedencia']).toBeTruthy();
  });

  it('infoErrors[nombre] debería mostrar error cuando submitted y campo vacío', () => {
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['nombre']).toBeTruthy();
  });

  it('infoErrors[capacidad] debería mostrar error cuando cantidad y capacidad tienen valor', () => {
    component['onInfoChange']({ cantidad: '5', capacidad: '10', procedencia: null, nombre: null });
    component['onFieldBlur']('capacidad');
    fixture.detectChanges();
    expect(component['infoErrors']()['capacidad']).toBeTruthy();
  });

  // ── onInfoChange ─────────────────────────────────────────────────────────

  it('onInfoChange debería patchear procedencia y nombre en el form', () => {
    component['onInfoChange']({
      procedencia: 'SEDE',
      nombre: 'Salón',
      cantidad: null,
      capacidad: null,
    });
    expect(component['form'].get('procedencia')?.value).toBe('SEDE');
    expect(component['form'].get('nombre')?.value).toBe('Salón');
  });

  it('onInfoChange debería convertir cantidad a número', () => {
    component['onInfoChange']({ procedencia: null, nombre: null, cantidad: '3', capacidad: null });
    expect(component['form'].get('cantidad')?.value).toBe(3);
  });

  it('onInfoChange debería ignorar cantidad si es string vacío', () => {
    component['onInfoChange']({ procedencia: null, nombre: null, cantidad: '', capacidad: null });
    expect(component['form'].get('cantidad')?.value).toBeNull();
  });

  it('onInfoChange debería establecer null si cantidad es string no numérico', () => {
    component['onInfoChange']({
      procedencia: null,
      nombre: null,
      cantidad: 'abc',
      capacidad: null,
    });
    expect(component['form'].get('cantidad')?.value).toBeNull();
  });

  // ── onPreciosChange ──────────────────────────────────────────────────────

  it('onPreciosChange debería convertir string a número para costoPersonaExtra', () => {
    component['onPreciosChange']({ costoPersonaExtra: '150' });
    expect(component['form'].get('costoPersonaExtra')?.value).toBe(150);
  });

  it('onPreciosChange debería dejar null si el string de costoPersonaExtra es vacío', () => {
    component['onPreciosChange']({ costoPersonaExtra: '' });
    expect(component['form'].get('costoPersonaExtra')?.value).toBeNull();
  });

  it('onPreciosChange debería establecer null si costoPersonaExtra es no numérico', () => {
    component['onPreciosChange']({ costoPersonaExtra: 'xyz' });
    expect(component['form'].get('costoPersonaExtra')?.value).toBeNull();
  });

  // ── Navegación ───────────────────────────────────────────────────────────

  it('onCancelar debería navegar a /servicios', () => {
    component['onCancelar']();
    expect(navigateSpy).toHaveBeenCalledWith(['/servicios']);
  });

  it('onConfirmar con form inválido debería marcar submitted y no llamar al servicio', () => {
    component['onConfirmar']();
    expect(component['submitted']()).toBe(true);
    expect(mockServicioService.create).not.toHaveBeenCalled();
  });

  // ── Integración con el servicio ──────────────────────────────────────────

  it('onConfirmar con form válido debería llamar a servicio.create con el DTO correcto', () => {
    fillValidForm();
    mockServicioService.create.mockReturnValue(
      of({
        id: 1,
        nombre: 'Test servicio',
        procedencia: 'CAMPING',
        estado: EstadoServicio.Habilitado,
      }),
    );
    component['onConfirmar']();
    expect(mockServicioService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Test servicio',
        procedencia: 'CAMPING',
        tarifas: [
          {
            tipoCliente: TipoClienteTarifa.Particular,
            precio: 100,
            modalidadPrecio: 'POR_DIA',
            antiguedadMinima: null,
            antiguedadMaxima: null,
          },
          {
            tipoCliente: TipoClienteTarifa.SocioComun,
            precio: 80,
            modalidadPrecio: 'POR_DIA',
            antiguedadMinima: null,
            antiguedadMaxima: null,
          },
        ],
      }),
    );
  });

  it('onConfirmar debería navegar a /servicios tras crear exitosamente', () => {
    fillValidForm();
    mockServicioService.create.mockReturnValue(
      of({
        id: 1,
        nombre: 'Test servicio',
        procedencia: 'CAMPING',
        estado: EstadoServicio.Habilitado,
      }),
    );
    component['onConfirmar']();
    expect(navigateSpy).toHaveBeenCalledWith(['/servicios']);
  });

  it('onConfirmar debería manejar el error y no navegar si el servicio falla', () => {
    const error = new Error('Error de servidor');

    fillValidForm();
    mockServicioService.create.mockReturnValue(throwError(() => error));

    component['onConfirmar']();

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
