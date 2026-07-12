import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReservaClienteBusquedaService } from './reserva-cliente-busqueda.service';
import { ClientesService } from '../../clientes/services/cliente.service';
import { EstadoSocio, TipoCliente } from '../../clientes/models/cliente.model';
import { ClienteBusquedaReservaDto, TipoDocumento } from '../models/reserva.model';

type Resultado = ClienteBusquedaReservaDto | null | undefined;

const page = <T>(content: T[]) => ({
  content,
  page: 0,
  size: 1,
  totalElements: content.length,
  totalPages: content.length ? 1 : 0,
  first: true,
  last: true,
});

const detalleSocio = {
  id: 1,
  nombre: 'Juan Pérez',
  cedula: '12345672',
  rut: null,
  tipoCliente: TipoCliente.Socio,
  numeroSocio: 5,
  estado: EstadoSocio.Activo,
  telefono: '099111111',
  email: 'juan@mail.com',
  observaciones: 'Cliente frecuente.',
};

const detalleEmpresa = {
  id: 3,
  nombre: 'Org Solidaria S.A.',
  cedula: null,
  rut: '211003420017',
  tipoCliente: TipoCliente.Empresa,
  numeroSocio: null,
  estado: null,
  telefono: '099333333',
  email: 'org@mail.com',
  observaciones: null,
};

const empresaPorRut = {
  id: 3,
  nombre: 'Org Solidaria S.A.',
  rut: '211003420017',
  telefono: '099333333',
  mail: 'org@mail.com',
  observaciones: 'Nota empresa',
  tipoCliente: TipoCliente.Empresa,
};

describe('ReservaClienteBusquedaService', () => {
  let service: ReservaClienteBusquedaService;
  let clientesService: {
    getByCedula: ReturnType<typeof vi.fn>;
    getByRut: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    clientesService = {
      getByCedula: vi.fn(),
      getByRut: vi.fn(),
      getById: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        ReservaClienteBusquedaService,
        { provide: ClientesService, useValue: clientesService },
      ],
    });
    service = TestBed.inject(ReservaClienteBusquedaService);
  });

  describe('buscarPorId', () => {
    it('para un cliente NO Empresa usa la cédula como documento', () => {
      clientesService.getById.mockReturnValue(of(detalleSocio));
      let resultado: Resultado;
      service.buscarPorId(1).subscribe((r) => (resultado = r));
      expect(clientesService.getById).toHaveBeenCalledWith(1);
      expect(resultado).toMatchObject({
        documento: '12345672',
        tipoDocumento: TipoDocumento.Cedula,
        tipoCliente: TipoCliente.Socio,
        numeroSocio: 5,
      });
    });

    it('para un cliente Empresa usa el RUT como documento', () => {
      clientesService.getById.mockReturnValue(of(detalleEmpresa));
      let resultado: Resultado;
      service.buscarPorId(3).subscribe((r) => (resultado = r));
      expect(resultado).toMatchObject({
        documento: '211003420017',
        tipoDocumento: TipoDocumento.Rut,
        tipoCliente: TipoCliente.Empresa,
      });
    });

    it('si el documento correspondiente es null lo mapea a cadena vacía', () => {
      clientesService.getById.mockReturnValue(of({ ...detalleEmpresa, rut: null }));
      let resultado: Resultado;
      service.buscarPorId(3).subscribe((r) => (resultado = r));
      expect(resultado?.documento).toBe('');
    });
  });

  describe('buscarPorCedula', () => {
    it('con coincidencia mapea el detalle del cliente encontrado', () => {
      clientesService.getByCedula.mockReturnValue(of(page([{ id: 1 }])));
      clientesService.getById.mockReturnValue(of(detalleSocio));
      let resultado: Resultado;
      service.buscarPorCedula('12345672').subscribe((r) => (resultado = r));
      expect(clientesService.getByCedula).toHaveBeenCalledWith('12345672');
      expect(clientesService.getById).toHaveBeenCalledWith(1);
      expect(resultado?.nombre).toBe('Juan Pérez');
    });

    it('sin coincidencia devuelve null', () => {
      clientesService.getByCedula.mockReturnValue(of(page([])));
      let resultado: unknown = 'sin asignar';
      service.buscarPorCedula('00000000').subscribe((r) => (resultado = r));
      expect(clientesService.getById).not.toHaveBeenCalled();
      expect(resultado).toBeNull();
    });
  });

  describe('buscarPorRut', () => {
    it('mapea el DTO de la Empresa (rut→documento, mail→email)', () => {
      clientesService.getByRut.mockReturnValue(of(empresaPorRut));
      let resultado: Resultado;
      service.buscarPorRut('211003420017').subscribe((r) => (resultado = r));
      expect(clientesService.getByRut).toHaveBeenCalledWith('211003420017');
      expect(resultado).toEqual({
        id: 3,
        nombre: 'Org Solidaria S.A.',
        documento: '211003420017',
        tipoDocumento: TipoDocumento.Rut,
        tipoCliente: TipoCliente.Empresa,
        numeroSocio: null,
        estado: null,
        telefono: '099333333',
        email: 'org@mail.com',
        observaciones: 'Nota empresa',
      });
    });

    it('traduce el 404 del backend a null (Empresa no encontrada)', () => {
      clientesService.getByRut.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 404 })),
      );
      let resultado: unknown = 'sin asignar';
      service.buscarPorRut('999999999997').subscribe((r) => (resultado = r));
      expect(resultado).toBeNull();
    });

    it('propaga cualquier otro error distinto de 404', () => {
      clientesService.getByRut.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500 })),
      );
      let errorStatus: number | undefined;
      service.buscarPorRut('211003420017').subscribe({
        error: (err: HttpErrorResponse) => (errorStatus = err.status),
      });
      expect(errorStatus).toBe(500);
    });
  });
});
