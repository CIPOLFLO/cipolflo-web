import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageResponse } from '../../../shared';
import { Procedencia } from '../../../shared/models/procedencia.model';
import { ServicioService } from '../../servicios/services/servicio.service';
import { EstadoServicio, ServicioRespuestaDto } from '../../servicios/models/servicio.model';
import { ReservasFilterService } from './reservas-filter.service';

const mockServicio: ServicioRespuestaDto = {
  id: 1,
  nombre: 'Pileta',
  procedencia: Procedencia.Sede,
  estado: EstadoServicio.Habilitado,
  capacidad: null,
  cantidad: null,
  costoPersonaExtra: null,
  tarifas: [],
};

const mockPage: PageResponse<ServicioRespuestaDto> = {
  content: [mockServicio],
  page: 0,
  size: 100,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

describe('ReservasFilterService', () => {
  let service: ReservasFilterService;
  let mockServicioService: { getAll: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockServicioService = { getAll: vi.fn().mockReturnValue(of(mockPage)) };

    TestBed.configureTestingModule({
      providers: [
        ReservasFilterService,
        { provide: ServicioService, useValue: mockServicioService },
      ],
    });

    service = TestBed.inject(ReservasFilterService);
  });

  it('expone 6 campos de filtro', () => {
    expect(service.filterFields()).toHaveLength(6);
  });

  it('procedencia incluye "Todos" como primera opción', () => {
    const field = service.filterFields().find((f) => f.key === 'procedencia');
    expect(field?.options?.[0]).toEqual({ label: 'Todos', value: '' });
  });

  it('estadoReserva incluye "Todos" como primera opción', () => {
    const field = service.filterFields().find((f) => f.key === 'estadoReserva');
    expect(field?.options?.[0]).toEqual({ label: 'Todos', value: '' });
  });

  it('servicio está deshabilitado por defecto', () => {
    const field = service.filterFields().find((f) => f.key === 'servicio');
    expect(field?.disabled).toBe(true);
  });

  it('servicio tiene solo la opción "Todos" por defecto', () => {
    const field = service.filterFields().find((f) => f.key === 'servicio');
    expect(field?.options).toEqual([{ label: 'Todos', value: '' }]);
  });

  it('onValueChange con key distinto a procedencia devuelve void', () => {
    const result = service.onValueChange('estadoReserva', 'PENDIENTE');
    expect(result).toBeUndefined();
  });

  it('onValueChange con key distinto a procedencia no llama a ServicioService', () => {
    service.onValueChange('estadoReserva', 'PENDIENTE');
    TestBed.flushEffects();
    expect(mockServicioService.getAll).not.toHaveBeenCalled();
  });

  it('onValueChange con procedencia devuelve { resetKeys: ["servicio"] }', () => {
    const result = service.onValueChange('procedencia', Procedencia.Sede);
    expect(result).toEqual({ resetKeys: ['servicio'] });
  });

  it('onValueChange con procedencia vacía no llama a ServicioService', () => {
    service.onValueChange('procedencia', '');
    TestBed.flushEffects();
    expect(mockServicioService.getAll).not.toHaveBeenCalled();
  });

  it('después de seleccionar procedencia el campo servicio se habilita', () => {
    service.onValueChange('procedencia', Procedencia.Sede);
    TestBed.flushEffects();

    const field = service.filterFields().find((f) => f.key === 'servicio');
    expect(field?.disabled).toBe(false);
  });

  it('después de seleccionar procedencia las opciones de servicio se cargan', () => {
    service.onValueChange('procedencia', Procedencia.Sede);
    TestBed.flushEffects();

    const field = service.filterFields().find((f) => f.key === 'servicio');
    expect(field?.options).toEqual([
      { label: 'Todos', value: '' },
      { label: 'Pileta', value: '1' },
    ]);
  });

  it('llama a ServicioService.getAll con la procedencia y estado Habilitado', () => {
    service.onValueChange('procedencia', Procedencia.Camping);
    TestBed.flushEffects();

    expect(mockServicioService.getAll).toHaveBeenCalledWith({
      page: 0,
      size: 100,
      filters: { procedencia: Procedencia.Camping, estado: EstadoServicio.Habilitado },
    });
  });

  it('onClear deshabilita el campo servicio y resetea sus opciones', () => {
    service.onValueChange('procedencia', Procedencia.Sede);
    TestBed.flushEffects();

    service.onClear();
    TestBed.flushEffects();

    const field = service.filterFields().find((f) => f.key === 'servicio');
    expect(field?.disabled).toBe(true);
    expect(field?.options).toEqual([{ label: 'Todos', value: '' }]);
  });

  it('al cambiar procedencia cancela el request anterior y lanza uno nuevo', () => {
    service.onValueChange('procedencia', Procedencia.Sede);
    TestBed.flushEffects();
    service.onValueChange('procedencia', Procedencia.Camping);
    TestBed.flushEffects();

    expect(mockServicioService.getAll).toHaveBeenCalledTimes(2);
    expect(mockServicioService.getAll).toHaveBeenLastCalledWith({
      page: 0,
      size: 100,
      filters: { procedencia: Procedencia.Camping, estado: EstadoServicio.Habilitado },
    });
  });
});
