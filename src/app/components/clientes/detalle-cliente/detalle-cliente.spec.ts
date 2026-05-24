import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router,convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { DetalleCliente } from './detalle-cliente';
import { ClientesService } from '../services/clientes.service';
import { ClienteDetalleRespuestaDto, EstadoCliente, TipoCliente,} from '../models/cliente.model';
import { By } from '@angular/platform-browser';

const mockCliente: ClienteDetalleRespuestaDto = {
  id: 1,
  nombre: 'Camila Ayuto',
  tipoCliente: TipoCliente.Socio,
  numeroSocio: '123',
  cedula: '5.191.926-8',
  email: 'email@example.com',
  estado: EstadoCliente.Activo,
  fechaNacimiento: '29/06/1999',
  telefono: '099985648',
  metodoPago: 'Cobradora',
  pais: 'Uruguay',
  departamento: 'Flores',
  ciudad: 'Trinidad',
  direccion: 'Calle A 123',
  observaciones: 'Socia Nueva',
  createdAt: '15 mar 2026, 14:30',
  createdBy: 'Juan Pérez',
  updatedAt: '15 mar 2026, 14:30',
  updatedBy: 'Juan Pérez',
};

function setup(
  overrides: {
    getById?: ReturnType<typeof vi.fn>;
    navigate?: ReturnType<typeof vi.fn>;
    paramId?: string;
  } = {},
): {
  fixture: ComponentFixture<DetalleCliente>;
  el: HTMLElement;
  navigateSpy: ReturnType<typeof vi.fn>;
  getByIdSpy: ReturnType<typeof vi.fn>;
} {
  const getByIdSpy = overrides.getById ?? vi.fn().mockReturnValue(of(mockCliente));
  const navigateSpy = overrides.navigate ?? vi.fn();
  const paramId = overrides.paramId ?? '1';

  TestBed.resetTestingModule();
  TestBed.overrideProvider(ClientesService, {
    useValue: { getById: getByIdSpy },
  });
  TestBed.overrideProvider(ActivatedRoute, {
    useValue: { paramMap: of(convertToParamMap({ id: paramId })) },
  });
  TestBed.overrideProvider(Router, {
    useValue: { navigate: navigateSpy },
  });

  const fixture = TestBed.createComponent(DetalleCliente);
  fixture.detectChanges();

  return { fixture, el: fixture.nativeElement, navigateSpy, getByIdSpy };
}


describe('DetalleCliente', () => {
  let component: DetalleCliente;
  let fixture: ComponentFixture<DetalleCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCliente],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => '1',
            }),
          },
        },
        {
          provide: Router,
          useValue: { navigate: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a getById con el id de la ruta', () => {
    const { getByIdSpy } = setup();
    expect(getByIdSpy).toHaveBeenCalledWith(1);
  });

  it('debería mostrar el nombre del cliente', () => {
    const { el } = setup();
    expect(el.textContent).toContain('Camila Ayuto');
  });

  it('debería mostrar la cédula del cliente', () => {
    const { el } = setup();
    expect(el.textContent).toContain('5.191.926-8');
  });

  it('debería mostrar el teléfono del cliente', () => {
    const { el } = setup();
    expect(el.textContent).toContain('099985648');
  });

  it('debería mostrar el método de pago', () => {
    const { el } = setup();
    expect(el.textContent).toContain('Cobradora');
  });

  it('debería mostrar la dirección del cliente', () => {
    const { el } = setup();
    expect(el.textContent).toContain('Calle A 123');
  });

  it('debería mostrar las observaciones', () => {
    const { el } = setup();
    expect(el.textContent).toContain('Socia Nueva');
  });

  it('debería navegar al detalle del cliente al hacer click en Editar', () => {
    const { fixture, navigateSpy } = setup();

    const editBtn = fixture.debugElement
      .queryAll(By.css('app-button'))
      .find((b) => b.nativeElement.textContent?.includes('Editar'));

    editBtn?.triggerEventHandler('clicked');

    expect(navigateSpy).toHaveBeenCalledWith(['/clientes', '1']);
  });
});
