import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModificarCliente } from './modificar-cliente';
import { ClientesService } from '../services/cliente.service';
import {
  ClienteDetalleRespuestaDto,
  TipoCliente,
  EstadoSocio,
  MetodoPago,
} from '../models/cliente.model';

const mockCliente: ClienteDetalleRespuestaDto = {
  id: 1,
  numeroSocio: '123',
  tipoCliente: TipoCliente.Socio,
  nombre: 'Juan Pérez',
  cedula: '1.234.567-8',
  email: 'juan@example.com',
  telefono: '099958654',
  metodoPago: MetodoPago.Cobradora,
  departamento: 'FLORES',
  direccion: 'Calle A 123',
  observaciones: 'Socio nuevo',
  estado: EstadoSocio.Activo,
  fechaNacimiento: '29/06/1999',
  createdAt: '15 mar 2026, 14:30',
  createdBy: 'Juan Pérez',
  updatedAt: '',
  updatedBy: '',
  pais: '',
  ciudad: '',
};

describe('ModificarCliente', () => {
  let fixture: ComponentFixture<ModificarCliente>;
  let component: ModificarCliente;
  let mockClientesService: { getById: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockClientesService = {
      getById: vi.fn().mockReturnValue(of(mockCliente)),
    };

    mockRouter = {
      navigate: vi.fn(),
      navigateByUrl: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ModificarCliente, ReactiveFormsModule],
      providers: [
        { provide: ClientesService, useValue: mockClientesService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: vi.fn().mockReturnValue('1') } },
            paramMap: of({ get: () => '1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '1');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('debe renderizar el título "Editar Cliente"', () => {
    expect(fixture.nativeElement.textContent).toContain('Editar Cliente');
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

  it('debe tener cedula deshabilitado', () => {
    expect(component['form'].get('cedula')?.disabled).toBe(true);
  });

  it('debe tener fechaNacimiento deshabilitado', () => {
    expect(component['form'].get('fechaNacimiento')?.disabled).toBe(true);
  });

  it('debe ser válido con datos correctos', () => {
    expect(component['form'].valid).toBe(true);
  });

  it('debe ser inválido si el email es vacío', () => {
    component['form'].get('email')?.setValue('');
    expect(component['form'].invalid).toBe(true);
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
    expect(keys).toContain('nombre');
    expect(keys).toContain('cedula');
    expect(keys).toContain('fechaNacimiento');
    expect(keys).toContain('numeroSocio');
    expect(keys).toContain('metodoPago');
  });

  it('infoFields debe retornar campos sin socio cuando el tipo es Particular', async () => {
    mockClientesService.getById.mockReturnValue(
      of({ ...mockCliente, tipoCliente: TipoCliente.Particular, numeroSocio: null }),
    );
    fixture = TestBed.createComponent(ModificarCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    const fields = component['infoFields']();
    const keys = fields.map((f) => f.key);
    expect(keys).not.toContain('fechaNacimiento');
    expect(keys).not.toContain('numeroSocio');
    expect(keys).not.toContain('metodoPago');
  });

  it('registroData debe construir el entityId con el id del cliente', () => {
    const data = component['registroData']();
    expect(data?.entityId).toBe('CLI-001');
  });

  it('confirmDisabled debe ser false con formulario válido y no cargando', () => {
    expect(component['confirmDisabled']()).toBe(false);
  });

  it('confirmDisabled debe ser true si el formulario está sucio e inválido', () => {
    component['form'].get('email')?.setValue('');
    component['form'].get('email')?.markAsDirty();
    expect(component['form'].dirty).toBe(true);
    expect(component['form'].invalid).toBe(true);
    expect(component['confirmDisabled']()).toBe(true);
  });

  it('onConfirmar no debe navegar si el formulario es inválido', () => {
    component['form'].get('email')?.setValue('');
    component['onConfirmar']();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('onCancelar debe navegar al backLink', () => {
    component['onCancelar']();
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(`/clientes/1`);
  });

  it('debe mostrar error en consola si falla la carga del cliente', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    mockClientesService.getById.mockReturnValue(throwError(() => new Error('Error al cargar')));

    fixture = TestBed.createComponent(ModificarCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('ModificarCliente - backLink', () => {
  it('backLink debe ser /clientes cuando from es listado', async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarCliente, ReactiveFormsModule],
      providers: [
        {
          provide: ClientesService,
          useValue: { getById: vi.fn().mockReturnValue(of(mockCliente)) },
        },
        { provide: Router, useValue: { navigate: vi.fn(), navigateByUrl: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: vi.fn().mockReturnValue('1') } },
            paramMap: of({ get: () => '1' }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('from', 'listado');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance['backLink']()).toBe('/clientes');
  });

  it('backLink debe ser /clientes/:id cuando from no es listado', async () => {
    const fixture = TestBed.createComponent(ModificarCliente);
    fixture.componentRef.setInput('id', '1');
    fixture.componentRef.setInput('from', 'detalle');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance['backLink']()).toBe('/clientes/1');
  });
});
