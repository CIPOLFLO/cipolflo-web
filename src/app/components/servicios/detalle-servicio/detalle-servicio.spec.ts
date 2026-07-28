import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DetalleServicio } from './detalle-servicio';
import { ServicioService } from '../services/servicio.service';
import {
  EstadoServicio,
  ServicioDetalleRespuestaDto,
  TipoClienteTarifa,
} from '../models/servicio.model';
import { AuthService } from '@auth0/auth0-angular';
import { UserService } from '../../../core/services/user.service';

const mockServicio: ServicioDetalleRespuestaDto = {
  id: 1,
  nombre: 'Cabaña 1',
  procedencia: 'CAMPING',
  estado: EstadoServicio.Habilitado,
  capacidad: 4,
  cantidad: null,
  costoPersonaExtra: null,
  createdAt: '2026-01-15T10:30:00Z',
  updatedAt: '2026-03-20T08:00:00Z',
  createdBy: 'María González',
  updatedBy: 'Juan Pérez',
  tarifas: [
    {
      id: 1,
      tipoCliente: TipoClienteTarifa.Particular,
      precio: 150,
      modalidadPrecio: 'POR_UNIDAD',
      antiguedadMinima: null,
      antiguedadMaxima: null,
    },
    {
      id: 2,
      tipoCliente: TipoClienteTarifa.SocioComun,
      precio: 100,
      modalidadPrecio: 'POR_UNIDAD',
      antiguedadMinima: 0,
      antiguedadMaxima: 5,
    },
  ],
};
const mockAuthService = {
  user$: of({ name: 'Juan Perez', email: 'juan@example.com' }),
  logout: vi.fn(),
};

const mockUserService = {
  userInitials: () => 'JP',
  userEmail: () => 'juan@example.com',
};

function setup(
  overrides: {
    getById?: ReturnType<typeof vi.fn>;
    navigate?: ReturnType<typeof vi.fn>;
    paramId?: string;
  } = {},
): {
  fixture: ComponentFixture<DetalleServicio>;
  el: HTMLElement;
  navigateSpy: ReturnType<typeof vi.fn>;
  getByIdSpy: ReturnType<typeof vi.fn>;
} {
  const getByIdSpy = overrides.getById ?? vi.fn().mockReturnValue(of(mockServicio));
  const navigateSpy = overrides.navigate ?? vi.fn();
  const paramId = overrides.paramId ?? '1';

  TestBed.overrideProvider(ServicioService, {
    useValue: { getById: getByIdSpy },
  });
  TestBed.overrideProvider(ActivatedRoute, {
    useValue: { paramMap: of(convertToParamMap({ id: paramId })) },
  });
  TestBed.overrideProvider(Router, {
    useValue: { navigate: navigateSpy },
  });

  const fixture = TestBed.createComponent(DetalleServicio);
  fixture.componentRef.setInput('id', paramId);
  fixture.detectChanges();

  return { fixture, el: fixture.nativeElement, navigateSpy, getByIdSpy };
}

describe('DetalleServicio', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleServicio],
      providers: [
        {
          provide: ServicioService,
          useValue: { getById: vi.fn().mockReturnValue(of(mockServicio)) },
        },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();
  });

  it('debería crear el componente', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería llamar a getById con el id de la ruta', () => {
    const { getByIdSpy } = setup();
    expect(getByIdSpy).toHaveBeenCalledWith(1);
  });

  it('debería mostrar el campo Procedencia con etiqueta legible', () => {
    const { el } = setup();
    expect(el.textContent).toContain('Camping');
  });

  it('debería mostrar el campo Nombre del Servicio', () => {
    const { el } = setup();
    expect(el.textContent).toContain('Cabaña 1');
  });

  it('debería mostrar el estado "Habilitado" como campo de texto cuando estado=HABILITADO', () => {
    const { el } = setup();
    expect(el.textContent).toContain('Habilitado');
  });

  it('debería mostrar el estado "Deshabilitado" como campo de texto cuando estado=DESHABILITADO', () => {
    const deshabilitado: ServicioDetalleRespuestaDto = {
      ...mockServicio,
      estado: EstadoServicio.Deshabilitado,
    };
    const { el } = setup({ getById: vi.fn().mockReturnValue(of(deshabilitado)) });
    expect(el.textContent).toContain('Deshabilitado');
  });

  it('debería mostrar la capacidad del servicio', () => {
    const { el } = setup();
    expect(el.textContent).toContain('4');
  });

  it('debería mostrar "---" para cantidad cuando es null', () => {
    const { el } = setup();
    expect(el.textContent).toContain('---');
  });

  it('no debería mostrar la sección de costo por persona extra cuando es null', () => {
    const { el } = setup();
    expect(el.textContent).not.toContain('Costo por persona extra');
  });

  it('debería mostrar el costo por persona extra cuando tiene valor', () => {
    const conCostoExtra: ServicioDetalleRespuestaDto = { ...mockServicio, costoPersonaExtra: 500 };
    const { el } = setup({ getById: vi.fn().mockReturnValue(of(conCostoExtra)) });
    expect(el.textContent).toContain('Costo por persona extra');
    expect(el.textContent).toContain('$ 500');
  });

  it('debería renderizar una fila por cada tarifa del servicio', () => {
    const { el } = setup();
    const filas = el.querySelectorAll('.tarifas-detalle__table tbody tr');
    expect(filas.length).toBe(2);
  });

  it('debería mostrar el tipo de cliente, precio y "---" de antigüedad para la fila Particular', () => {
    const { el } = setup();
    const filas = el.querySelectorAll('.tarifas-detalle__table tbody tr');
    expect(filas[0].textContent).toContain('Particular');
    expect(filas[0].textContent).toContain('$ 150');
    expect(filas[0].textContent).toContain('---');
  });

  it('debería mostrar el rango de antigüedad para la fila Socio Común', () => {
    const { el } = setup();
    const filas = el.querySelectorAll('.tarifas-detalle__table tbody tr');
    expect(filas[1].textContent).toContain('Socio Común');
    expect(filas[1].textContent).toContain('0 - 5 años');
  });

  it('no debería renderizar la sección de tarifas mientras el servicio no cargó', () => {
    const { el } = setup({ getById: vi.fn().mockReturnValue(throwError(() => ({ status: 404 }))) });
    expect(el.querySelector('.tarifas-detalle__table')).toBeNull();
  });

  it('debería mostrar el ID del servicio formateado como SRV-001 en la sección de registro', () => {
    const { el } = setup();
    expect(el.textContent).toContain('SRV-001');
  });

  it('debería mostrar createdBy en la sección de registro', () => {
    const { el } = setup();
    expect(el.textContent).toContain('María González');
  });

  it('debería navegar a /servicios/1/editar al hacer click en Editar', () => {
    const { fixture, navigateSpy } = setup();
    const editBtn = fixture.debugElement
      .queryAll(By.css('app-button'))
      .find((b) => b.nativeElement.textContent?.includes('Editar'));
    editBtn?.triggerEventHandler('clicked', null);
    expect(navigateSpy).toHaveBeenCalledWith(['/servicios', '1', 'editar']);
  });

  it('debería no romper el componente cuando el servicio retorna error 404', () => {
    const { fixture } = setup({
      getById: vi.fn().mockReturnValue(throwError(() => ({ status: 404 }))),
    });
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance['servicio']()).toBeNull();
  });

  it('debería no romper el componente cuando el servicio retorna error 401', () => {
    const { fixture } = setup({
      getById: vi.fn().mockReturnValue(throwError(() => ({ status: 401 }))),
    });
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance['servicio']()).toBeNull();
  });
});
