import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NuevaEmpresa } from './nueva-empresa';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ClientesService } from '../services/cliente.service';
import { ClienteValidacionesService } from '../services/cliente-validaciones.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';
import { EstadoSocio, MetodoCobro, TipoCliente } from '../models/cliente.model';

const empresaMock = {
  id: 5,
  tipoCliente: TipoCliente.Empresa,
  numeroSocio: null,
  cedula: null,
  rut: '211003420017',
  nombre: 'Antel S.A.',
  telefono: '099123456',
  email: 'empresa@mail.com',
  pais: 'Uruguay',
  departamento: 'Montevideo',
  ciudad: 'Montevideo',
  direccion: 'Guatemala 1075',
  observaciones: null,
  fechaNacimiento: null,
  estado: null as EstadoSocio | null,
  metodoCobro: null as MetodoCobro | null,
  categoriaSocio: null,
  fechaIngreso: null,
  antiguedad: null,
  createdAt: '2026-01-01',
  createdBy: 'admin',
  updatedAt: '2026-01-01',
  updatedBy: 'admin',
  ultimaCuotaDto: null,
};

const mockAuthService = {
  user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
  logout: vi.fn(),
};

const mockUserService = {
  userInitials: () => 'JP',
  userEmail: () => 'juan@example.com',
};

function formularioValido(component: NuevaEmpresa): void {
  component['form'].patchValue({
    razonSocial: 'Antel S.A.',
    rut: '21.100342.001-7',
    telefono: '099123456',
    departamento: 'Montevideo',
    ciudad: 'Montevideo',
    direccion: 'Guatemala 1075',
  });
}

describe('NuevaEmpresa', () => {
  let fixture: ComponentFixture<NuevaEmpresa>;
  let component: NuevaEmpresa;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let navigateByUrlSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigateSpy = vi.fn();
    navigateByUrlSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [NuevaEmpresa],
      providers: [
        {
          provide: Router,
          useValue: { navigate: navigateSpy, navigateByUrl: navigateByUrlSpy },
        },
        {
          provide: ClientesService,
          useValue: {
            registrarEmpresa: vi.fn().mockReturnValue(of(empresaMock)),
          },
        },
        {
          provide: ErrorHandlerService,
          useValue: { handle: vi.fn() },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        ClienteValidacionesService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevaEmpresa);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar con el formulario vacío excepto pais', () => {
    expect(component['form'].get('razonSocial')?.value).toBeNull();
    expect(component['form'].get('rut')?.value).toBeNull();
    expect(component['form'].get('pais')?.value).toBe('Uruguay');
  });

  it('confirmDisabled debería ser true cuando el form es inválido', () => {
    expect(component['confirmDisabled']()).toBe(true);
  });

  it('confirmDisabled debería ser false cuando el form es válido', () => {
    formularioValido(component);
    fixture.detectChanges();
    expect(component['confirmDisabled']()).toBe(false);
  });

  it('infoErrors debería estar vacío cuando submitted es false', () => {
    expect(component['infoErrors']()).toEqual({});
  });

  it('ubicacionErrors debería estar vacío cuando submitted es false', () => {
    expect(component['ubicacionErrors']()).toEqual({});
  });

  it('infoErrors[razonSocial] debería mostrar error cuando submitted y campo vacío', () => {
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['razonSocial']).toBeTruthy();
  });

  it('infoErrors[rut] debería mostrar error cuando el RUT es inválido', () => {
    component['form'].get('rut')?.setValue('123');
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['rut']).toBeTruthy();
  });

  it('ubicacionErrors[direccion] debería mostrar error cuando submitted y campo vacío', () => {
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['ubicacionErrors']()['direccion']).toBeTruthy();
  });

  it('onInfoChange debería patchear los datos de la empresa en el form', () => {
    component['onInfoChange']({
      razonSocial: 'Cipolatti S.A.',
      rut: '21.100342.001-7',
      telefono: '099000000',
      mail: 'contacto@cipolatti.com',
    });
    expect(component['form'].get('razonSocial')?.value).toBe('Cipolatti S.A.');
    expect(component['form'].get('mail')?.value).toBe('contacto@cipolatti.com');
  });

  it('onUbicacionChange debería patchear los datos de ubicación en el form', () => {
    component['onUbicacionChange']({
      pais: 'Argentina',
      departamento: 'Buenos Aires',
      ciudad: 'CABA',
      direccion: 'Av. Corrientes 123',
    });
    expect(component['form'].get('pais')?.value).toBe('Argentina');
    expect(component['form'].get('ciudad')?.value).toBe('CABA');
  });

  it('onAdicionalChange debería patchear observaciones en el form', () => {
    component['onAdicionalChange']({ observaciones: 'Nota de prueba' });
    expect(component['form'].get('observaciones')?.value).toBe('Nota de prueba');
  });

  it('onFieldBlur debería marcar el campo como touched', () => {
    component['onFieldBlur']('razonSocial');
    expect(component['form'].get('razonSocial')?.touched).toBe(true);
  });

  it('onCancelar debería navegar usando backLink', () => {
    component['onCancelar']();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/clientes');
  });

  it('onConfirmar con form inválido debería marcar submitted como true y no navegar', () => {
    component['onConfirmar']();
    expect(component['submitted']()).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('onConfirmar con form válido navega a /clientes al registrar con éxito', () => {
    formularioValido(component);
    fixture.detectChanges();
    component['onConfirmar']();

    expect(navigateSpy).toHaveBeenCalledWith(['/clientes']);
  });

  it('onConfirmar llama errorHandler.handle cuando el RUT es inválido (RUT_INVALIDO)', () => {
    const service = TestBed.inject(ClientesService);
    const errorHandler = TestBed.inject(ErrorHandlerService);
    const error = { status: 400, error: { codigo: 'RUT_INVALIDO' } };
    vi.spyOn(service, 'registrarEmpresa').mockReturnValue(throwError(() => error));

    formularioValido(component);
    fixture.detectChanges();
    component['onConfirmar']();

    expect(errorHandler.handle).toHaveBeenCalledWith(error);
  });

  it('onConfirmar llama errorHandler.handle cuando el RUT está duplicado (RUT_DUPLICADO)', () => {
    const service = TestBed.inject(ClientesService);
    const errorHandler = TestBed.inject(ErrorHandlerService);
    const error = { status: 400, error: { codigo: 'RUT_DUPLICADO' } };
    vi.spyOn(service, 'registrarEmpresa').mockReturnValue(throwError(() => error));

    formularioValido(component);
    fixture.detectChanges();
    component['onConfirmar']();

    expect(errorHandler.handle).toHaveBeenCalledWith(error);
  });

  it('loading vuelve a false luego de registrar (vía finalize)', () => {
    const service = TestBed.inject(ClientesService);
    vi.spyOn(service, 'registrarEmpresa').mockReturnValue(of(empresaMock));

    formularioValido(component);
    fixture.detectChanges();
    component['onConfirmar']();

    expect(component['loading']()).toBe(false);
  });
});
