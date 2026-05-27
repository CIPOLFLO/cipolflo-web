import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { DetalleCliente } from './detalle-cliente';
import { ClientesService } from '../services/clientes.service';
import { ClienteDetalleRespuestaDto, EstadoSocio, TipoCliente } from '../models/cliente.model';

const mockCliente: ClienteDetalleRespuestaDto = {
  id: 1,
  nombre: 'Camila Ayuto',
  tipoCliente: TipoCliente.Socio,
  numeroSocio: '123',
  cedula: '5.191.926-8',
  email: 'email@example.com',
  estado: EstadoSocio.Activo,
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

describe('DetalleCliente', () => {
  let fixture: ComponentFixture<DetalleCliente>;
  let component: DetalleCliente;
  let getByIdSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getByIdSpy = vi.fn().mockReturnValue(of(mockCliente));

    await TestBed.configureTestingModule({
      imports: [DetalleCliente],
      providers: [
        {
          provide: ClientesService,
          useValue: { getById: getByIdSpy },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
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
});
