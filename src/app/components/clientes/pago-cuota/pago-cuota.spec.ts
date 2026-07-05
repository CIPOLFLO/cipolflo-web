import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { PagoCuota } from './pago-cuota';
import { ClienteRespuestaDto, EstadoSocio, TipoCliente } from '../models/cliente.model';
import { ClientesService } from '../services/cliente.service';
import { MetodoCobro } from '../models/cliente.model';
import { PagoCuotaResponseDto } from '../models/pago-cuota.model';
const mockCliente: ClienteRespuestaDto = {
  id: 1,
  nombreCompleto: 'Lucía Rodríguez',
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 123,
  cedula: '5.191.926-8',
  rut: null,
  email: 'lucia@example.com',
  estado: EstadoSocio.Activo,
  ultimaCuotaDto: {
    anio: 2026,
    mes: 6,
    nombreMes: 'junio',
    descripcion: 'Junio 2026',
  },
};
const mockPagoCuotaResponse: PagoCuotaResponseDto[] = [
  {
    id: 1,
    socioId: mockCliente.id,
    anio: 2026,
    mes: 7,
    nombreMes: 'julio',
    descripcion: 'Julio 2026',
    fechaPago: '2026-03-27T03:00:00Z',
    importe: 5000,
    metodoCobro: MetodoCobro.Efectivo,
  },
];

describe('PagoCuota', () => {
  let component: PagoCuota;
  let fixture: ComponentFixture<PagoCuota>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoCuota],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ClientesService,
          useValue: {
            getCostoCuota: () => 5000,
            registrarPagoCuota: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PagoCuota);
    fixture.componentRef.setInput('cliente', mockCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('onCancelar emite cancelado', () => {
    const canceladoSpy = vi.spyOn(component.cerrado, 'emit');

    component['onCancelar']();

    expect(canceladoSpy).toHaveBeenCalled();
  });

  it('onConfirmar no confirma si el formulario es inválido', () => {
    component['form'].controls.cantidadCuotas.setValue(0);

    component['onConfirmar']();

    expect(component['pagoConfirmado']()).toBeNull();
  });

  it('onConfirmar no confirma si la fecha es futura', () => {
    component['form'].controls.fechaPago.setValue(new Date(2999, 0, 1));

    component['onConfirmar']();

    expect(component['pagoConfirmado']()).toBeNull();
  });

  it('onConfirmar guarda el pago confirmado si el formulario es válido', () => {
    const clientesService = TestBed.inject(ClientesService);
    vi.spyOn(clientesService, 'registrarPagoCuota').mockReturnValue(of(mockPagoCuotaResponse));

    component['form'].patchValue({
      cantidadCuotas: 1,
      metodoCobro: MetodoCobro.Efectivo,
      observaciones: null,
      fechaPago: new Date(2026, 2, 27),
    });

    component['onConfirmar']();

    expect(clientesService.registrarPagoCuota).toHaveBeenCalled();
    expect(component['pagoConfirmado']()).toEqual(mockPagoCuotaResponse);
  });

  it('cerrarConfirmacion limpia el pago confirmado y emite cerrado', () => {
    const cerradoSpy = vi.spyOn(component.cerrado, 'emit');

    component['pagoConfirmado'].set([
      {
        id: 1,
        socioId: mockCliente.id,
        anio: 2026,
        mes: 7,
        nombreMes: 'julio',
        descripcion: 'Julio 2026',
        fechaPago: '2026-03-27T03:00:00Z',
        importe: 5000,
        metodoCobro: MetodoCobro.Efectivo,
      },
    ]);

    component['cerrarConfirmacion']();

    expect(component['pagoConfirmado']()).toBeNull();
    expect(cerradoSpy).toHaveBeenCalled();
  });

  it('muestra el error de cantidad inválida cuando cantidadCuotas < 1', async () => {
    component['form'].controls.cantidadCuotas.setValue(0);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['cantidadInvalida']()).toBe(true);
  });

  it('muestra el error de fecha futura cuando fechaPago es posterior a hoy', async () => {
    component['form'].controls.fechaPago.setValue(new Date(2999, 0, 1));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['fechaEsFutura']()).toBe(true);
  });

  it('el botón "Confirmar pago" llama a onConfirmar al hacer click ', async () => {
    const clientesService = TestBed.inject(ClientesService);
    vi.spyOn(clientesService, 'registrarPagoCuota').mockReturnValue(of(mockPagoCuotaResponse));

    const confirmarSpy = vi.spyOn(component as PagoCuota & { onConfirmar(): void }, 'onConfirmar');
    const nativeButtons = Array.from(document.querySelectorAll('button'));
    const confirmBtn = nativeButtons.find((b) => b.textContent?.trim().includes('Confirmar pago'));

    confirmBtn?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(confirmarSpy).toHaveBeenCalled();
  });

  describe('periodosCubiertos', () => {
    async function setCantidad(cantidad: number): Promise<void> {
      component['form'].controls.cantidadCuotas.setValue(cantidad);
      fixture.detectChanges();
      await fixture.whenStable();
    }

    it('arranca en el mes siguiente a la última cuota (junio → julio)', async () => {
      await setCantidad(1);

      expect(component['periodosCubiertos']()).toEqual(['Julio 2026']);
    });

    it('cubre tantos meses consecutivos como cuotas indicadas', async () => {
      await setCantidad(3);

      expect(component['periodosCubiertos']()).toEqual([
        'Julio 2026',
        'Agosto 2026',
        'Setiembre 2026',
      ]);
    });

    it('cruza de año cuando la última cuota es diciembre (mes 12 → enero del año siguiente)', async () => {
      fixture.componentRef.setInput('cliente', {
        ...mockCliente,
        ultimaCuotaDto: {
          anio: 2026,
          mes: 12,
          nombreMes: 'diciembre',
          descripcion: 'Diciembre 2026',
        },
      });
      await setCantidad(2);

      expect(component['periodosCubiertos']()).toEqual(['Enero 2027', 'Febrero 2027']);
    });

    it('sin cuota previa arranca en el mes actual', async () => {
      fixture.componentRef.setInput('cliente', { ...mockCliente, ultimaCuotaDto: null });
      await setCantidad(1);

      const hoy = new Date();
      const nombreMes = hoy.toLocaleDateString('es-UY', { month: 'long' });
      const esperado = `${nombreMes.charAt(0).toUpperCase()}${nombreMes.slice(1)} ${hoy.getFullYear()}`;

      expect(component['periodosCubiertos']()).toEqual([esperado]);
    });

    it('devuelve lista vacía si no hay cliente', async () => {
      fixture.componentRef.setInput('cliente', null);
      await setCantidad(1);

      expect(component['periodosCubiertos']()).toEqual([]);
    });
  });

  it('renderiza el bloque de confirmación cuando pagoConfirmado no es null (líneas 99-108)', async () => {
    const pago: PagoCuotaResponseDto[] = [
      {
        id: 1,
        socioId: mockCliente.id,
        anio: 2026,
        mes: 7,
        nombreMes: 'julio',
        descripcion: 'Julio 2026',
        fechaPago: '2026-03-27T03:00:00Z',
        importe: 5000,
        metodoCobro: MetodoCobro.Efectivo,
      },
    ];
    component['pagoConfirmado'].set(pago);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['pagoConfirmado']()).toEqual(pago);
  });
});
