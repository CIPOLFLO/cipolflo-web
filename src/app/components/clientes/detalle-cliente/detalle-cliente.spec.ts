import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  CategoriaSocio,
  ClienteDetalleRespuestaDto,
  EstadoSocio,
  MetodoCobro,
  TipoCliente,
} from '../models/cliente.model';
import { ClientesService } from '../services/cliente.service';
import { DetalleCliente } from './detalle-cliente';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';

const mockCliente: ClienteDetalleRespuestaDto = {
  id: 1,
  nombre: 'Camila Ayuto',
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 123,
  cedula: '5.191.926-8',
  rut: null,
  email: 'email@example.com',
  estado: EstadoSocio.Activo,
  fechaNacimiento: '29/06/1999',
  telefono: '099985648',
  metodoCobro: MetodoCobro.Cobradora,
  pais: 'Uruguay',
  departamento: 'Flores',
  ciudad: 'Trinidad',
  direccion: 'Calle A 123',
  categoriaSocio: CategoriaSocio.SocioComun,
  antiguedad: 5,
  fechaIngreso: '2020-01-01',
  observaciones: 'Socia Nueva',
  createdAt: '2026-03-15T14:30:00Z',
  createdBy: 'Juan Pérez',
  updatedAt: '2026-03-15T14:30:00Z',
  updatedBy: 'Juan Pérez',
  ultimaCuotaDto: {
    anio: 2026,
    mes: 5,
    nombreMes: 'junio',
    descripcion: 'Junio 2026',
  },
};
const mockAuthService = {
  user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
  logout: vi.fn(),
};

const mockUserService = {
  userInitials: () => 'JP',
  userEmail: () => 'juan@example.com',
};

describe('DetalleCliente', () => {
  let fixture: ComponentFixture<DetalleCliente>;
  let component: DetalleCliente;
  let getByIdSpy: ReturnType<typeof vi.fn>;
  let mockErrorHandler: {
    handle: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    getByIdSpy = vi.fn().mockReturnValue(of(mockCliente));
    mockErrorHandler = { handle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [DetalleCliente],
      providers: [
        { provide: ClientesService, useValue: { getById: getByIdSpy } },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a getById con el id de la ruta', () => {
    expect(getByIdSpy).toHaveBeenCalledWith(1);
  });

  it('debería mostrar el nombre del cliente', () => {
    expect(fixture.nativeElement.textContent).toContain('Camila Ayuto');
  });

  it('debería mostrar la cédula del cliente', () => {
    expect(fixture.nativeElement.textContent).toContain('5.191.926-8');
  });

  it('debería mostrar el teléfono del cliente', () => {
    expect(fixture.nativeElement.textContent).toContain('099985648');
  });

  it('debería mostrar el método de pago', () => {
    expect(fixture.nativeElement.textContent).toContain('Cobradora');
  });

  it('debería mostrar la dirección del cliente', () => {
    expect(fixture.nativeElement.textContent).toContain('Calle A 123');
  });

  it('debería mostrar las observaciones', () => {
    expect(fixture.nativeElement.textContent).toContain('Socia Nueva');
  });

  it('debería mostrar la categoría del socio con su label', () => {
    const field = component['infoFields']().find((f) => f.key === 'categoriaSocio');
    expect(field?.value).toBe('Socio común');
  });

  it('debería mostrar la fecha de ingreso del socio', () => {
    const field = component['infoFields']().find((f) => f.key === 'fechaIngreso');
    expect(field?.value).toBe('2020-01-01');
  });

  it('debería manejar el error cuando falla la carga del detalle del cliente', () => {
    const error = new Error('Error al cargar cliente');

    getByIdSpy.mockReturnValue(throwError(() => error));

    fixture = TestBed.createComponent(DetalleCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
  });

  it('onEditar debe navegar a la pantalla de modificación con queryParam from=detalle', () => {
    const navigateSpy = component['router'].navigate as ReturnType<typeof vi.fn>;
    component['onEditar']();
    expect(navigateSpy).toHaveBeenCalledWith(['/clientes', '1', 'modificar'], {
      queryParams: { from: 'detalle' },
    });
  });
  it('debería mostrar la sección de última cuota paga', () => {
    expect(fixture.nativeElement.textContent).toContain('Última cuota paga');
  });
});

describe('DetalleCliente con metodoCobro null (cliente PARTICULAR)', () => {
  let fixture: ComponentFixture<DetalleCliente>;
  let component: DetalleCliente;

  const mockParticular: ClienteDetalleRespuestaDto = {
    ...mockCliente,
    tipoCliente: TipoCliente.Particular,
    numeroSocio: null,
    estado: null,
    metodoCobro: null,
    categoriaSocio: null,
    fechaIngreso: null,
    ultimaCuotaDto: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCliente],
      providers: [
        {
          provide: ClientesService,
          useValue: { getById: vi.fn().mockReturnValue(of(mockParticular)) },
        },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ErrorHandlerService, useValue: { handle: vi.fn() } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente sin errores', () => {
    expect(component).toBeTruthy();
  });

  it('el campo metodoCobro tiene value null', () => {
    const field = component['infoFields']().find((f) => f.key === 'metodoCobro');
    expect(field?.value).toBeNull();
  });

  it('no debería mostrar sección de última cuota paga cuando no existe información', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Última cuota paga');
  });

  it('el campo categoriaSocio tiene value null', () => {
    const field = component['infoFields']().find((f) => f.key === 'categoriaSocio');
    expect(field?.value).toBeNull();
  });

  it('el campo fechaIngreso tiene value null', () => {
    const field = component['infoFields']().find((f) => f.key === 'fechaIngreso');
    expect(field?.value).toBeNull();
  });
});
