import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditarServicio } from './editar-servicio';
import { ServicioService } from '../services/servicio.service';
import {
  EstadoServicio,
  ServicioDetalleRespuestaDto,
  TipoClienteTarifa,
} from '../models/servicio.model';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ConfirmDialogService } from '../../../shared';
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
      id: 10,
      tipoCliente: TipoClienteTarifa.Particular,
      precio: 1200,
      modalidadPrecio: 'POR_DIA',
      antiguedadMinima: null,
      antiguedadMaxima: null,
    },
    {
      id: 11,
      tipoCliente: TipoClienteTarifa.SocioComun,
      precio: 800,
      modalidadPrecio: 'POR_DIA',
      antiguedadMinima: null,
      antiguedadMaxima: null,
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
    update?: ReturnType<typeof vi.fn>;
    eliminarTarifa?: ReturnType<typeof vi.fn>;
    navigate?: ReturnType<typeof vi.fn>;
    navigateByUrl?: ReturnType<typeof vi.fn>;
    id?: string;
    from?: string;
  } = {},
): {
  fixture: ComponentFixture<EditarServicio>;
  component: EditarServicio;
  getByIdSpy: ReturnType<typeof vi.fn>;
  updateSpy: ReturnType<typeof vi.fn>;
  eliminarTarifaSpy: ReturnType<typeof vi.fn>;
  navigateSpy: ReturnType<typeof vi.fn>;
  navigateByUrlSpy: ReturnType<typeof vi.fn>;
} {
  const getByIdSpy = overrides.getById ?? vi.fn().mockReturnValue(of(mockServicio));
  const updateSpy = overrides.update ?? vi.fn().mockReturnValue(of({}));
  const eliminarTarifaSpy = overrides.eliminarTarifa ?? vi.fn().mockReturnValue(of(undefined));
  const navigateSpy = overrides.navigate ?? vi.fn();
  const navigateByUrlSpy = overrides.navigateByUrl ?? vi.fn();

  TestBed.overrideProvider(ServicioService, {
    useValue: { getById: getByIdSpy, update: updateSpy, eliminarTarifa: eliminarTarifaSpy },
  });
  TestBed.overrideProvider(Router, {
    useValue: { navigate: navigateSpy, navigateByUrl: navigateByUrlSpy },
  });

  const fixture = TestBed.createComponent(EditarServicio);
  fixture.componentRef.setInput('id', overrides.id ?? '1');
  if (overrides.from !== undefined) fixture.componentRef.setInput('from', overrides.from);
  fixture.detectChanges();

  return {
    fixture,
    component: fixture.componentInstance,
    getByIdSpy,
    updateSpy,
    eliminarTarifaSpy,
    navigateSpy,
    navigateByUrlSpy,
  };
}

describe('EditarServicio', () => {
  let mockErrorHandler: {
    handle: ReturnType<typeof vi.fn>;
  };
  let mockConfirmDialogService: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockErrorHandler = { handle: vi.fn() };
    mockConfirmDialogService = { open: vi.fn().mockReturnValue(of(true)) };
    await TestBed.configureTestingModule({
      imports: [EditarServicio],
      providers: [
        {
          provide: ServicioService,
          useValue: {
            getById: vi.fn().mockReturnValue(of(mockServicio)),
            update: vi.fn().mockReturnValue(of({})),
          },
        },
        { provide: Router, useValue: { navigate: vi.fn(), navigateByUrl: vi.fn() } },
        { provide: ErrorHandlerService, useValue: mockErrorHandler },
        { provide: ConfirmDialogService, useValue: mockConfirmDialogService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();
  });

  it('debería crear el componente', () => {
    const { component } = setup();
    expect(component).toBeTruthy();
  });

  it('debería llamar a getById con el id de la ruta', () => {
    const { getByIdSpy } = setup();
    expect(getByIdSpy).toHaveBeenCalledWith(1);
  });

  it('debería poblar el formulario con los datos del servicio cargado', () => {
    const { component } = setup();
    expect(component['form'].get('nombre')?.value).toBe('Cabaña 1');
    expect(component['form'].get('procedencia')?.value).toBe('CAMPING');
    expect(component['form'].get('estado')?.value).toBe(EstadoServicio.Habilitado);
    expect(component['form'].get('costoPersonaExtra')?.value).toBeNull();
  });

  it('debería precargar las tarifas del servicio en el FormArray', () => {
    const { component } = setup();
    expect(component['tarifas'].length).toBe(2);
    expect(component['tarifas'].at(0).getRawValue()).toMatchObject({
      id: 10,
      tipoCliente: TipoClienteTarifa.Particular,
      precio: 1200,
    });
    expect(component['tarifas'].at(1).getRawValue()).toMatchObject({
      id: 11,
      tipoCliente: TipoClienteTarifa.SocioComun,
      precio: 800,
    });
  });

  it('debería renderizar en el DOM las filas de tarifas precargadas', () => {
    const { fixture } = setup();
    const filas = fixture.nativeElement.querySelectorAll(
      '.tarifas-table tbody tr:not(.tarifas-table__error-row)',
    );
    expect(filas.length).toBe(2);
  });

  it('agregarTarifa debería agregar una fila nueva (sin id) al final', () => {
    const { component } = setup();
    component['agregarTarifa']();
    expect(component['tarifas'].length).toBe(3);
    expect(component['tarifas'].at(2).controls.id.value).toBeNull();
  });

  it('quitarTarifa con una fila sin id la quita del FormArray sin llamar al servicio', () => {
    const { component, eliminarTarifaSpy } = setup();
    component['agregarTarifa']();

    component['quitarTarifa'](2);

    expect(component['tarifas'].length).toBe(2);
    expect(eliminarTarifaSpy).not.toHaveBeenCalled();
  });

  it('quitarTarifa con una fila con id llama a eliminarTarifa y la quita si tiene éxito', () => {
    const eliminarTarifaSpy = vi.fn().mockReturnValue(of(undefined));
    const { component } = setup({ eliminarTarifa: eliminarTarifaSpy });

    component['quitarTarifa'](0);

    expect(mockConfirmDialogService.open).toHaveBeenCalled();
    expect(eliminarTarifaSpy).toHaveBeenCalledWith(1, 10);
    expect(component['tarifas'].length).toBe(1);
    expect(component['tarifas'].at(0).controls.id.value).toBe(11);
  });

  it('quitarTarifa con una fila con id no llama a eliminarTarifa si se cancela la confirmación', () => {
    mockConfirmDialogService.open.mockReturnValue(of(false));
    const eliminarTarifaSpy = vi.fn().mockReturnValue(of(undefined));
    const { component } = setup({ eliminarTarifa: eliminarTarifaSpy });

    component['quitarTarifa'](0);

    expect(eliminarTarifaSpy).not.toHaveBeenCalled();
    expect(component['tarifas'].length).toBe(2);
  });

  it('quitarTarifa con una fila con id no la quita si el servicio falla, y delega el error', () => {
    const error = new Error('TARIFA_OBLIGATORIA_NO_ELIMINABLE');
    const eliminarTarifaSpy = vi.fn().mockReturnValue(throwError(() => error));
    const { component } = setup({ eliminarTarifa: eliminarTarifaSpy });

    component['quitarTarifa'](0);

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    expect(component['tarifas'].length).toBe(2);
  });

  it('pageDescription debería mostrar el nombre del servicio', () => {
    const { component } = setup();
    expect(component['pageDescription']()).toContain('Cabaña 1');
  });

  it('pageDescription debería mostrar texto genérico cuando el servicio no está cargado', () => {
    const { component } = setup({
      getById: vi.fn().mockReturnValue(throwError(() => new Error())),
    });
    expect(component['pageDescription']()).toBe('Modifique los datos del servicio');
  });

  it('backLink apunta al detalle del servicio cuando from está vacío', () => {
    const { component } = setup();
    expect(component['backLink']()).toBe('/servicios/1');
  });

  it('backLink apunta al listado cuando from es "listado"', () => {
    const { component } = setup({ from: 'listado' });
    expect(component['backLink']()).toBe('/servicios');
  });

  it('no rompe el componente cuando getById retorna error', () => {
    const { component } = setup({
      getById: vi.fn().mockReturnValue(throwError(() => ({ status: 404 }))),
    });
    expect(component).toBeTruthy();
    expect(component['servicio']()).toBeNull();
  });

  // ── onInfoChange ────────────────────────────────────────────────────────────

  it('onInfoChange parchea procedencia y nombre en el form', () => {
    const { component } = setup();
    component['onInfoChange']({
      procedencia: 'SEDE',
      nombre: 'Salón',
      estado: null,
      cantidad: null,
      capacidad: null,
    });
    expect(component['form'].get('procedencia')?.value).toBe('SEDE');
    expect(component['form'].get('nombre')?.value).toBe('Salón');
  });

  it('onInfoChange parchea el estado', () => {
    const { component } = setup();
    component['onInfoChange']({
      procedencia: null,
      nombre: null,
      estado: EstadoServicio.Deshabilitado,
      cantidad: null,
      capacidad: null,
    });
    expect(component['form'].get('estado')?.value).toBe(EstadoServicio.Deshabilitado);
  });

  it('onInfoChange convierte cantidad a número entero', () => {
    const { component } = setup();
    component['onInfoChange']({
      procedencia: null,
      nombre: null,
      estado: null,
      cantidad: '5',
      capacidad: null,
    });
    expect(component['form'].get('cantidad')?.value).toBe(5);
  });

  it('onInfoChange establece null si cantidad es string vacío', () => {
    const { component } = setup();
    component['onInfoChange']({
      procedencia: null,
      nombre: null,
      estado: null,
      cantidad: '',
      capacidad: null,
    });
    expect(component['form'].get('cantidad')?.value).toBeNull();
  });

  it('onInfoChange establece null si cantidad es string no numérico', () => {
    const { component } = setup();
    component['onInfoChange']({
      procedencia: null,
      nombre: null,
      estado: null,
      cantidad: 'abc',
      capacidad: null,
    });
    expect(component['form'].get('cantidad')?.value).toBeNull();
  });

  it('onInfoChange marca el form como dirty', () => {
    const { component } = setup();
    component['onInfoChange']({
      procedencia: 'SEDE',
      nombre: null,
      estado: null,
      cantidad: null,
      capacidad: null,
    });
    expect(component['form'].dirty).toBe(true);
  });

  // ── onPreciosChange ─────────────────────────────────────────────────────────

  it('onPreciosChange convierte string a número para costoPersonaExtra', () => {
    const { component } = setup();
    component['onPreciosChange']({ costoPersonaExtra: '200' });
    expect(component['form'].get('costoPersonaExtra')?.value).toBe(200);
  });

  it('onPreciosChange establece null cuando el string de costoPersonaExtra es vacío', () => {
    const { component } = setup();
    component['onPreciosChange']({ costoPersonaExtra: '' });
    expect(component['form'].get('costoPersonaExtra')?.value).toBeNull();
  });

  it('onPreciosChange establece null cuando costoPersonaExtra es no numérico', () => {
    const { component } = setup();
    component['onPreciosChange']({ costoPersonaExtra: 'abc' });
    expect(component['form'].get('costoPersonaExtra')?.value).toBeNull();
  });

  it('onPreciosChange marca el form como dirty', () => {
    const { component } = setup();
    component['onPreciosChange']({ costoPersonaExtra: '100' });
    expect(component['form'].dirty).toBe(true);
  });

  // ── Errores ─────────────────────────────────────────────────────────────────

  it('infoErrors debería estar vacío con el form pristine sin submit', () => {
    const { component } = setup();
    expect(component['infoErrors']()).toEqual({});
  });

  it('infoErrors muestra error de cantidadYCapacidad en cuanto el campo es tocado', () => {
    const { component } = setup();
    component['onInfoChange']({
      procedencia: null,
      nombre: null,
      estado: null,
      cantidad: '5',
      capacidad: '10',
    });
    expect(component['infoErrors']()['capacidad']).toBeTruthy();
  });

  it('infoErrors no muestra error de cantidadYCapacidad si los campos no fueron tocados', () => {
    const { component } = setup();
    component['form'].get('cantidad')!.setValue(5);
    component['form'].get('capacidad')!.setValue(10);
    expect(component['infoErrors']()['capacidad']).toBeUndefined();
  });

  // ── Navegación ──────────────────────────────────────────────────────────────

  it('onCancelar navega al detalle del servicio cuando from está vacío', () => {
    const { component, navigateByUrlSpy } = setup();
    component['onCancelar']();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/servicios/1');
  });

  it('onCancelar navega al listado cuando from es "listado"', () => {
    const { component, navigateByUrlSpy } = setup({ from: 'listado' });
    component['onCancelar']();
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/servicios');
  });

  it('onConfirmar con form inválido marca submitted y no llama a update', () => {
    const { component, updateSpy } = setup({
      getById: vi.fn().mockReturnValue(throwError(() => new Error())),
    });
    component['onConfirmar']();
    expect(component['submitted']()).toBe(true);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('onConfirmar con form válido llama a update con los datos correctos', () => {
    const { component, updateSpy } = setup();
    component['onConfirmar']();
    expect(updateSpy).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        nombre: 'Cabaña 1',
        procedencia: 'CAMPING',
        estado: EstadoServicio.Habilitado,
      }),
    );
  });

  it('onConfirmar navega al detalle tras actualizar exitosamente', () => {
    const { component, navigateSpy } = setup();
    component['onConfirmar']();
    expect(navigateSpy).toHaveBeenCalledWith(['/servicios', '1']);
  });

  it('onConfirmar maneja el error y no navega si update falla', () => {
    const error = new Error('fail');

    const { component, navigateSpy } = setup({
      update: vi.fn().mockReturnValue(throwError(() => error)),
    });

    component['onConfirmar']();

    expect(mockErrorHandler.handle).toHaveBeenCalledWith(error);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  // ── confirmDisabled ──────────────────────────────────────────────────────────

  it('confirmDisabled es false cuando el form es válido', () => {
    const { component, fixture } = setup();
    fixture.detectChanges();
    expect(component['confirmDisabled']()).toBe(false);
  });

  it('confirmDisabled es true cuando el form está dirty e inválido', () => {
    const { component, fixture } = setup();
    component['onInfoChange']({ nombre: null });
    fixture.detectChanges();
    expect(component['confirmDisabled']()).toBe(true);
  });

  it('confirmDisabled es true mientras loading es true', () => {
    const { component, fixture } = setup();
    component['loading'].set(true);
    fixture.detectChanges();
    expect(component['confirmDisabled']()).toBe(true);
  });

  // ── Keys parciales en onInfoChange / onPreciosChange ─────────────────────────

  it('onInfoChange solo modifica las claves presentes, dejando las demás sin cambio', () => {
    const { component } = setup();
    component['onInfoChange']({ procedencia: 'SEDE' });
    expect(component['form'].get('procedencia')?.value).toBe('SEDE');
    expect(component['form'].get('nombre')?.value).toBe('Cabaña 1');
    expect(component['form'].get('estado')?.value).toBe(EstadoServicio.Habilitado);
    expect(component['form'].get('capacidad')?.value).toBe(4);
  });

  it('onPreciosChange solo modifica las claves presentes, dejando las demás sin cambio', () => {
    const { component } = setup();
    component['onPreciosChange']({ costoPersonaExtra: '150' });
    expect(component['form'].get('costoPersonaExtra')?.value).toBe(150);
  });
});
