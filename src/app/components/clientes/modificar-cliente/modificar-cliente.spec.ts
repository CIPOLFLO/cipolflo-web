import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModificarCliente } from './modificar-cliente';
import { ClientesService } from '../services/cliente.service';
import { ClienteValidacionesService } from '../services/cliente-validaciones.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import {
  ClienteDetalleRespuestaDto,
  TipoCliente,
  EstadoSocio,
  MetodoCobro,
  CategoriaSocio,
} from '../models/cliente.model';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';

const mockCliente: ClienteDetalleRespuestaDto = {
  id: 1,
  numeroSocio: 123,
  tipoCliente: TipoCliente.Socio,
  nombre: 'Juan Pérez',
  cedula: '5.191.926-8',
  rut: null,
  email: 'juan@example.com',
  telefono: '099958654',
  metodoCobro: MetodoCobro.Transferencia,
  pais: 'Uruguay',
  departamento: 'Flores',
  ciudad: 'Trinidad',
  direccion: 'Calle A 123',
  observaciones: 'Socio nuevo',
  estado: EstadoSocio.Activo,
  fechaNacimiento: '1999-06-29',
  categoriaSocio: CategoriaSocio.SocioComun,
  antiguedad: 5,
  fechaIngreso: '2020-01-01',
  createdAt: '15 mar 2026, 14:30',
  createdBy: 'Juan Pérez',
  updatedAt: '',
  updatedBy: '',
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

describe('ModificarCliente', () => {
  let fixture: ComponentFixture<ModificarCliente>;
  let component: ModificarCliente;
  let mockClientesService: {
    getById: ReturnType<typeof vi.fn>;
    modificarSocio: ReturnType<typeof vi.fn>;
    modificarParticular: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };
  let mockErrorHandler: { handle: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockClientesService = {
      getById: vi.fn().mockReturnValue(of(mockCliente)),
      modificarSocio: vi.fn().mockReturnValue(of(mockCliente)),
      modificarParticular: vi.fn().mockReturnValue(of(mockCliente)),
    };

    mockRouter = {
      navigate: vi.fn(),
      navigateByUrl: vi.fn(),
    };

    mockErrorHandler = { handle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ModificarCliente, ReactiveFormsModule],
      providers: [
        { provide: ClientesService, useValue: mockClientesService },
        { provide: Router, useValue: mockRouter },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
        ClienteValidacionesService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: vi.fn().mockReturnValue('1') },
              queryParamMap: { get: vi.fn().mockReturnValue(null) },
            },
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe renderizar el título "Modificar Cliente"', () => {
    expect(fixture.nativeElement.textContent).toContain('Modificar Cliente');
  });

  it('debe llamar a ClientesService.getById al inicializar', () => {
    expect(mockClientesService.getById).toHaveBeenCalledWith(1);
  });

  it('debe cargar los datos del cliente en el formulario', () => {
    expect(component['form'].get('email')?.value).toBe('juan@example.com');
    expect(component['form'].get('telefono')?.value).toBe('099958654');
    expect(component['form'].get('direccion')?.value).toBe('Calle A 123');
  });

  it('debe tener numeroSocio deshabilitado', () => {
    expect(component['form'].get('numeroSocio')?.disabled).toBe(true);
  });

  it('debe ser válido con datos correctos', () => {
    expect(component['form'].valid).toBe(true);
  });

  it('email vacío no invalida el formulario (no es obligatorio)', () => {
    component['form'].get('email')?.setValue('');
    expect(component['form'].invalid).toBe(false);
  });

  it('debe ser inválido si el email tiene formato incorrecto', () => {
    component['form'].get('email')?.setValue('email-invalido');
    expect(component['form'].get('email')?.errors?.['email']).toBeTruthy();
  });

  it('debe ser inválido si el nombre es vacío', () => {
    component['form'].get('nombre')?.setValue('');
    expect(component['form'].invalid).toBe(true);
  });

  it('debe ser inválido si el teléfono es vacío', () => {
    component['form'].get('telefono')?.setValue('');
    expect(component['form'].invalid).toBe(true);
  });

  it('infoFields debe retornar campos de socio cuando el tipo es Socio', () => {
    const fields = component['infoFields']();
    const keys = fields.map((f) => f.key);
    expect(keys).toContain('tipoCliente');
    expect(keys).toContain('numeroSocio');
    expect(keys).toContain('nombre');
    expect(keys).toContain('cedula');
    expect(keys).toContain('fechaNacimiento');
    expect(keys).toContain('metodoCobro');
    expect(keys).toContain('categoriaSocio');
    expect(keys).toContain('fechaIngreso');
    expect(keys.indexOf('numeroSocio')).toBe(0);
    expect(keys.indexOf('tipoCliente')).toBe(1);
  });

  it('el campo estado es de sólo lectura (modificarSocio no persiste el estado)', () => {
    const estado = component['infoFields']().find((f) => f.key === 'estado');
    expect(estado?.disabled).toBe(true);
    expect(estado?.locked).toBe(true);
    expect(estado?.defaultValue).toBe(EstadoSocio.Activo);
  });

  it('infoFields precarga categoriaSocio y fechaIngreso con los valores actuales del socio', () => {
    const fields = component['infoFields']();
    expect(fields.find((f) => f.key === 'categoriaSocio')?.defaultValue).toBe(
      CategoriaSocio.SocioComun,
    );
    expect(fields.find((f) => f.key === 'fechaIngreso')?.defaultValue).toBe('2020-01-01');
  });

  it('infoFields debe retornar campos de particular cuando el tipo es Particular', async () => {
    mockClientesService.getById.mockReturnValue(
      of({ ...mockCliente, tipoCliente: TipoCliente.Particular, numeroSocio: null }),
    );
    fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const fields = component['infoFields']();
    const keys = fields.map((f) => f.key);
    expect(keys).toContain('tipoCliente');
    expect(keys.indexOf('tipoCliente')).toBe(0);
    expect(keys).not.toContain('fechaNacimiento');
    expect(keys).not.toContain('numeroSocio');
    expect(keys).not.toContain('metodoCobro');
    expect(keys).not.toContain('categoriaSocio');
    expect(keys).not.toContain('fechaIngreso');
  });

  it('infoFields y ubicacionFields cubren branches ?? con todos los campos opcionales nulos', async () => {
    // Fuerza null en campos string no-nullable del DTO para cubrir el branch `?? undefined`
    const clienteConNulos = {
      ...mockCliente,
      nombre: null as unknown as string,
      cedula: null as unknown as string,
      telefono: null as unknown as string,
      email: null,
      numeroSocio: null,
      fechaNacimiento: null,
      metodoCobro: null,
      estado: null,
      pais: null,
      departamento: null,
      ciudad: null,
      direccion: null,
      observaciones: null,
    } as ClienteDetalleRespuestaDto;

    mockClientesService.getById.mockReturnValue(of(clienteConNulos));

    fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const infoFields = component['infoFields']();
    const keys = infoFields.map((f) => f.key);
    expect(keys).toContain('numeroSocio');

    // Todos los defaultValue de campos nulos deben ser undefined
    expect(infoFields.find((f) => f.key === 'nombre')?.defaultValue).toBeUndefined();
    expect(infoFields.find((f) => f.key === 'email')?.defaultValue).toBeUndefined();
    expect(infoFields.find((f) => f.key === 'fechaNacimiento')?.defaultValue).toBeUndefined();
    expect(infoFields.find((f) => f.key === 'metodoCobro')?.defaultValue).toBeUndefined();
    expect(infoFields.find((f) => f.key === 'estado')?.defaultValue).toBeUndefined();

    const ubicFields = component['ubicacionFields']();
    expect(ubicFields.find((f) => f.key === 'pais')?.defaultValue).toBeUndefined();
    expect(ubicFields.find((f) => f.key === 'departamento')?.defaultValue).toBeUndefined();
    expect(ubicFields.find((f) => f.key === 'ciudad')?.defaultValue).toBeUndefined();
    expect(ubicFields.find((f) => f.key === 'direccion')?.defaultValue).toBeUndefined();
  });

  it('registroData debe construir el entityId con el id del cliente', () => {
    const data = component['registroData']();
    expect(data?.entityId).toBe('CLI-001');
  });

  it('confirmDisabled debe ser false con formulario válido y sucio', () => {
    component['form'].markAsDirty();
    fixture.detectChanges();
    expect(component['confirmDisabled']()).toBe(false);
  });

  it('confirmDisabled debe ser true si el formulario está sucio e inválido', () => {
    component['form'].get('nombre')?.setValue('');
    component['form'].markAsDirty();
    fixture.detectChanges();
    expect(component['form'].dirty).toBe(true);
    expect(component['form'].invalid).toBe(true);
    expect(component['confirmDisabled']()).toBe(true);
  });

  it('onConfirmar no debe navegar si el formulario es inválido', () => {
    component['form'].get('nombre')?.setValue('');
    component['onConfirmar']();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('onConfirmar llama a modificarSocio con el payload correcto', () => {
    component['onConfirmar']();
    expect(mockClientesService.modificarSocio).toHaveBeenCalledWith(1, {
      cedula: '5.191.926-8',
      nombreCompleto: 'Juan Pérez',
      telefono: '099958654',
      mail: 'juan@example.com',
      notas: 'Socio nuevo',
      fechaNacimiento: '1999-06-29',
      pais: 'Uruguay',
      departamento: 'Flores',
      ciudad: 'Trinidad',
      direccion: 'Calle A 123',
      categoriaSocio: 'SOCIO_COMUN',
      fechaIngreso: '2020-01-01',
      metodoCobro: MetodoCobro.Transferencia,
    });
  });

  it('onConfirmar navega al detalle del cliente en éxito para socio', () => {
    component['onConfirmar']();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/clientes', '1']);
  });

  it('onConfirmar llama a errorHandler.handle si modificarSocio falla', () => {
    const error = new Error('Error de red');
    mockClientesService.modificarSocio.mockReturnValue(throwError(() => error));
    component['onConfirmar']();
    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
  });

  it('ubicacionFields retorna campos vacíos para cliente particular', async () => {
    mockClientesService.getById.mockReturnValue(
      of({ ...mockCliente, tipoCliente: TipoCliente.Particular, numeroSocio: null }),
    );
    fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['ubicacionFields']()).toEqual([]);
  });

  it('onCancelar debe navegar al backLink', () => {
    component['onCancelar']();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(`/clientes/1`);
  });

  it('debe navegar al listado si el id no es válido', async () => {
    fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/clientes']);
  });

  it('no establece cliente si el servicio emite un valor falsy', async () => {
    mockClientesService.getById.mockReturnValue(of(null as unknown as ClienteDetalleRespuestaDto));
    fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['cliente']()).toBeNull();
  });

  it('debe llamar a errorHandler.handle si falla la carga del cliente', async () => {
    const error = new Error('Error al cargar');
    mockClientesService.getById.mockReturnValue(throwError(() => error));

    fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
  });
});

describe('ModificarCliente - onConfirmar Particular', () => {
  let fixture: ComponentFixture<ModificarCliente>;
  let component: ModificarCliente;
  let mockClientesService: {
    getById: ReturnType<typeof vi.fn>;
    modificarSocio: ReturnType<typeof vi.fn>;
    modificarParticular: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };
  let mockErrorHandler: { handle: ReturnType<typeof vi.fn> };

  const mockParticular: ClienteDetalleRespuestaDto = {
    ...mockCliente,
    tipoCliente: TipoCliente.Particular,
    numeroSocio: null,
    estado: null,
    fechaNacimiento: null,
    metodoCobro: null,
    pais: null,
    departamento: null,
    ciudad: null,
    direccion: null,
  };

  beforeEach(async () => {
    mockClientesService = {
      getById: vi.fn().mockReturnValue(of(mockParticular)),
      modificarSocio: vi.fn().mockReturnValue(of(mockParticular)),
      modificarParticular: vi.fn().mockReturnValue(of(mockParticular)),
    };
    mockRouter = { navigate: vi.fn(), navigateByUrl: vi.fn() };
    mockErrorHandler = { handle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ModificarCliente, ReactiveFormsModule],
      providers: [
        { provide: ClientesService, useValue: mockClientesService },
        { provide: Router, useValue: mockRouter },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
        ClienteValidacionesService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: vi.fn().mockReturnValue('2') },
              queryParamMap: { get: vi.fn().mockReturnValue(null) },
            },
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '2');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('onConfirmar llama a modificarParticular con el payload correcto', () => {
    component['onConfirmar']();
    expect(mockClientesService.modificarParticular).toHaveBeenCalledWith(2, {
      nombreCompleto: 'Juan Pérez',
      telefono: '099958654',
      mail: 'juan@example.com',
      notas: 'Socio nuevo',
    });
  });

  it('onConfirmar navega al detalle del cliente en éxito para particular', () => {
    component['onConfirmar']();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/clientes', '2']);
  });

  it('onConfirmar llama a errorHandler.handle si modificarParticular falla', () => {
    const error = new Error('Error de red');
    mockClientesService.modificarParticular.mockReturnValue(throwError(() => error));
    component['onConfirmar']();
    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
  });
});

describe('ModificarCliente - backLink', () => {
  let fixture: ComponentFixture<ModificarCliente>;

  const crearComponente = async (from: string | null) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ModificarCliente, ReactiveFormsModule],
      providers: [
        {
          provide: ClientesService,
          useValue: { getById: vi.fn().mockReturnValue(of(mockCliente)) },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn(), navigateByUrl: vi.fn() },
        },
        ClienteValidacionesService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: { get: vi.fn().mockReturnValue('1') },
              queryParamMap: { get: vi.fn().mockReturnValue(from) },
            },
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '1');
    fixture.detectChanges();
    await fixture.whenStable();

    return fixture.componentInstance;
  };

  it('backLink debe ser /clientes cuando from es listado', async () => {
    const component = await crearComponente('listado');
    expect(component['backLink']()).toBe('/clientes');
  });

  it('backLink debe ser /clientes/:id cuando from no es listado', async () => {
    const component = await crearComponente('detalle');
    expect(component['backLink']()).toBe('/clientes/1');
  });
});
