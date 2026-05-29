import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoCuota } from './pago-cuota';
import { ClienteRespuestaDto, EstadoCliente, TipoCliente } from '../models/cliente.model';

const mockCliente: ClienteRespuestaDto = {
  id: 1,
  nombre: 'Lucía Rodríguez',
  tipoCliente: TipoCliente.Socio,
  numeroSocio: '123',
  cedula: '5.191.926-8',
  email: 'lucia@example.com',
  estado: EstadoCliente.Activo,
  fechaNacimiento: '1990-01-01',
  telefono: '099123456',
  metodoPago: 'COBRADORA',
};

describe('PagoCuota', () => {
  let component: PagoCuota;
  let fixture: ComponentFixture<PagoCuota>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoCuota],
    }).compileComponents();

    fixture = TestBed.createComponent(PagoCuota);
    fixture.componentRef.setInput('cliente', mockCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
