import { ActivatedRoute, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NuevoCliente } from './nuevo-cliente';
import { EstadoSocio, MetodoCobro, TipoCliente, CategoriaSocio } from '../models/cliente.model';
import { NEVER, of, throwError } from 'rxjs';
import { ClientesService } from '../services/cliente.service';
import { ClienteValidacionesService } from '../services/cliente-validaciones.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';
import { ConfirmDialogService, startOfToday, toIsoDate } from '../../../shared';

const clienteMock = {
  id: 1,
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 42,
  cedula: '5.191.926-8',
  rut: null,
  nombre: 'Lucía Rodríguez',
  telefono: '099985648',
  email: 'lucia@example.com',
  pais: 'Uruguay',
  departamento: 'Flores',
  ciudad: 'Trinidad',
  direccion: 'Calle A 123',
  categoriaSocio: CategoriaSocio.SocioComun,
  fechaIngreso: '2020-01-01',
  observaciones: null,
  fechaNacimiento: '1999-06-29',
  estado: EstadoSocio.Activo,
  metodoCobro: MetodoCobro.Transferencia,
  createdAt: '2024-01-01',
  createdBy: 'admin',
  updatedAt: '2024-01-02',
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

describe('NuevoCliente', () => {
  let fixture: ComponentFixture<NuevoCliente>;
  let component: NuevoCliente;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let navigateByUrlSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    navigateSpy = vi.fn();
    navigateByUrlSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [NuevoCliente],
      providers: [
        {
          provide: Router,
          useValue: { navigate: navigateSpy, navigateByUrl: navigateByUrlSpy },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: vi.fn().mockReturnValue('1') },
              queryParamMap: { get: vi.fn().mockReturnValue(null) },
            },
            paramMap: of({ get: () => '1' }),
          },
        },
        {
          provide: ClientesService,
          useValue: {
            getById: vi.fn().mockReturnValue(of(clienteMock)),
            registrarSocio: vi.fn().mockReturnValue(NEVER),
            descargarComprobanteAltaSocio: vi.fn().mockReturnValue(of(undefined)),
          },
        },
        {
          provide: ErrorHandlerService,
          useValue: { handle: vi.fn() },
        },
        {
          provide: ConfirmDialogService,
          useValue: { open: vi.fn().mockReturnValue(of(false)) },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        ClienteValidacionesService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevoCliente);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar con el formulario vacío excepto pais', () => {
    expect(component['form'].get('nombre')?.value).toBeNull();
    expect(component['form'].get('email')?.value).toBeNull();
    expect(component['form'].get('pais')?.value).toBe('Uruguay');
  });

  it('debería inicializar categoriaSocio y fechaIngreso con sus valores por defecto', () => {
    expect(component['form'].get('categoriaSocio')?.value).toBe(CategoriaSocio.SocioComun);
    expect(component['form'].get('fechaIngreso')?.value).toBe(toIsoDate(startOfToday()));
  });

  it('confirmDisabled debería ser true cuando el form es inválido y sucio', () => {
    component['form'].get('nombre')?.setValue('');
    component['form'].markAsDirty();
    fixture.detectChanges();
    expect(component['confirmDisabled']()).toBe(true);
  });

  it('confirmDisabled debería ser false cuando el form es válido', () => {
    component['form'].patchValue({
      nombre: 'Juan',
      cedula: '5.191.926-8',
      telefono: '099000000',
      email: 'a@b.com',
      pais: 'Uruguay',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      fechaNacimiento: '1999-06-29',
    });
    component['form'].markAsDirty();
    fixture.detectChanges();
    expect(component['confirmDisabled']()).toBe(false);
  });

  it('infoErrors debería estar vacío cuando submitted es false', () => {
    expect(component['infoErrors']()).toEqual({});
  });

  it('ubicacionErrors debería estar vacío cuando submitted es false', () => {
    expect(component['ubicacionErrors']()).toEqual({});
  });

  it('infoErrors[nombre] debería mostrar error cuando submitted y nombre vacío', () => {
    component['form'].get('nombre')?.setValue(null);
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['nombre']).toBeTruthy();
  });

  it('infoErrors[email] debería mostrar error con email inválido', () => {
    const email = component['form'].get('email');

    email?.setValue('email-invalido');
    email?.markAsTouched();
    email?.updateValueAndValidity();

    component['submitted'].set(true);

    fixture.detectChanges();

    expect(email?.hasError('email')).toBe(true);
    expect(component['infoErrors']()['email']).toBe('El email no es válido.');
  });

  it('infoErrors[telefono] debería mostrar error cuando submitted y campo vacío', () => {
    component['form'].get('telefono')?.setValue(null);
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['telefono']).toBeTruthy();
  });

  it('ubicacionErrors[pais] debería mostrar error cuando submitted y campo vacío', () => {
    component['form'].get('pais')?.setValue(null);
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['ubicacionErrors']()['pais']).toBeTruthy();
  });

  it('infoErrors[categoriaSocio] debería mostrar error cuando submitted y campo vacío', () => {
    component['form'].get('categoriaSocio')?.setValue(null);
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['categoriaSocio']).toBeTruthy();
  });

  it('infoErrors[fechaIngreso] debería mostrar error cuando submitted y campo vacío', () => {
    component['form'].get('fechaIngreso')?.setValue(null);
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['fechaIngreso']).toBeTruthy();
  });

  it('infoErrors[fechaIngreso] debería mostrar error con fecha futura', () => {
    const nextYear = new Date().getFullYear() + 1;
    const fechaIngreso = component['form'].get('fechaIngreso');
    fechaIngreso?.setValue(`${nextYear}-01-01`);
    fechaIngreso?.markAsTouched();
    fechaIngreso?.updateValueAndValidity();
    component['submitted'].set(true);
    fixture.detectChanges();
    expect(component['infoErrors']()['fechaIngreso']).toBe(
      'La fecha de ingreso no puede ser posterior a hoy.',
    );
  });

  it('onInfoChange debería patchear los datos del cliente en el form', () => {
    component['onInfoChange']({
      nombre: 'Martín González',
      cedula: '2.345.678-9',
      telefono: '099123456',
      email: 'martin@example.com',
    });
    expect(component['form'].get('nombre')?.value).toBe('Martín González');
    expect(component['form'].get('email')?.value).toBe('martin@example.com');
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
    component['onFieldBlur']('nombre');
    expect(component['form'].get('nombre')?.touched).toBe(true);
  });

  it('onCancelar debería navegar usando backLink', () => {
    component['onCancelar']();
    expect(navigateByUrlSpy).toHaveBeenCalled();
  });

  it('onConfirmar con form inválido debería marcar submitted como true', () => {
    component['form'].get('nombre')?.setValue(null);
    component['onConfirmar']();
    expect(component['submitted']()).toBe(true);
  });

  it('onConfirmar con form válido marca submitted y no retorna temprano', () => {
    component['form'].patchValue({
      nombre: 'Juan',
      cedula: '5.191.926-8',
      telefono: '099000000',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      fechaNacimiento: '1999-06-29',
    });
    fixture.detectChanges();
    component['onConfirmar']();
    expect(component['submitted']()).toBe(true);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('onConfirmar con form válido navega a /clientes/:id al registrar con éxito', () => {
    const service = TestBed.inject(ClientesService);
    vi.spyOn(service, 'registrarSocio').mockReturnValue(of(clienteMock));

    component['form'].patchValue({
      nombre: 'Juan',
      cedula: '5.191.926-8',
      telefono: '099000000',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      fechaNacimiento: '1999-06-29',
    });
    fixture.detectChanges();
    component['onConfirmar']();

    expect(navigateSpy).toHaveBeenCalledWith(['/clientes', clienteMock.id]);
  });

  it('onConfirmar ofrece el comprobante y navega igual si el usuario cancela la descarga', () => {
    const service = TestBed.inject(ClientesService);
    const confirmDialog = TestBed.inject(ConfirmDialogService);
    vi.spyOn(service, 'registrarSocio').mockReturnValue(of(clienteMock));
    vi.spyOn(confirmDialog, 'open').mockReturnValue(of(false));

    component['form'].patchValue({
      nombre: 'Juan',
      cedula: '5.191.926-8',
      telefono: '099000000',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      fechaNacimiento: '1999-06-29',
    });
    fixture.detectChanges();
    component['onConfirmar']();

    expect(confirmDialog.open).toHaveBeenCalled();
    expect(service.descargarComprobanteAltaSocio).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/clientes', clienteMock.id]);
  });

  it('onConfirmar descarga el comprobante y navega cuando el usuario confirma', () => {
    const service = TestBed.inject(ClientesService);
    const confirmDialog = TestBed.inject(ConfirmDialogService);
    vi.spyOn(service, 'registrarSocio').mockReturnValue(of(clienteMock));
    vi.spyOn(confirmDialog, 'open').mockReturnValue(of(true));
    const descargarSpy = vi
      .spyOn(service, 'descargarComprobanteAltaSocio')
      .mockReturnValue(of(undefined));

    component['form'].patchValue({
      nombre: 'Juan',
      cedula: '5.191.926-8',
      telefono: '099000000',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      fechaNacimiento: '1999-06-29',
    });
    fixture.detectChanges();
    component['onConfirmar']();

    expect(descargarSpy).toHaveBeenCalledWith(clienteMock.id);
    expect(navigateSpy).toHaveBeenCalledWith(['/clientes', clienteMock.id]);
  });

  it('onConfirmar envía categoriaSocio y fechaIngreso en el DTO a registrarSocio', () => {
    const service = TestBed.inject(ClientesService);
    const registrarSocioSpy = vi.spyOn(service, 'registrarSocio').mockReturnValue(of(clienteMock));

    component['form'].patchValue({
      nombre: 'Juan',
      cedula: '5.191.926-8',
      telefono: '099000000',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      fechaNacimiento: '1999-06-29',
      categoriaSocio: CategoriaSocio.PoliciaActivo,
      fechaIngreso: '2020-01-01',
    });
    fixture.detectChanges();
    component['onConfirmar']();

    expect(registrarSocioSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        categoriaSocio: CategoriaSocio.PoliciaActivo,
        fechaIngreso: '2020-01-01',
      }),
    );
  });

  it('onConfirmar llama errorHandler.handle cuando el servicio retorna error', () => {
    const service = TestBed.inject(ClientesService);
    const errorHandler = TestBed.inject(ErrorHandlerService);
    const error = new Error('500');
    vi.spyOn(service, 'registrarSocio').mockReturnValue(throwError(() => error));

    component['form'].patchValue({
      nombre: 'Juan',
      cedula: '5.191.926-8',
      telefono: '099000000',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      fechaNacimiento: '1999-06-29',
    });
    fixture.detectChanges();
    component['onConfirmar']();

    expect(errorHandler.handle).toHaveBeenCalledWith(error);
  });

  it('loading vuelve a false luego de registrar (vía finalize)', () => {
    const service = TestBed.inject(ClientesService);
    vi.spyOn(service, 'registrarSocio').mockReturnValue(of(clienteMock));

    component['form'].patchValue({
      nombre: 'Juan',
      cedula: '5.191.926-8',
      telefono: '099000000',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      fechaNacimiento: '1999-06-29',
    });
    fixture.detectChanges();
    component['onConfirmar']();

    expect(component['loading']()).toBe(false);
  });
});
