import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DestinatarioNotificacionEmailService } from './destinatario-notificacion-email.service';
import { environment } from '@env/environment';
import { DestinatarioNotificacionEmailResponseDto } from '../models/ajuste.model';

const emptyPage = {
  content: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

const mockDestinatario: DestinatarioNotificacionEmailResponseDto = {
  id: 1,
  email: 'administracion@cipolflo.com',
  alias: 'Administración',
  activo: true,
  createdAt: '2026-01-10T09:00:00Z',
  updatedAt: '2026-01-10T09:00:00Z',
};

describe('DestinatarioNotificacionEmailService', () => {
  let service: DestinatarioNotificacionEmailService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DestinatarioNotificacionEmailService,
      ],
    });
    service = TestBed.inject(DestinatarioNotificacionEmailService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('hace GET a /ajustes/destinatarios-notificacion-email con page y size', () => {
      service.getAll({ page: 0, size: 10, filters: {} }).subscribe();
      const req = httpMock.expectOne(
        (r) => r.url === `${environment.apiUrl}/ajustes/destinatarios-notificacion-email`,
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('0');
      expect(req.request.params.get('size')).toBe('10');
      req.flush(emptyPage);
    });

    it('incluye los filtros activos en los query params', () => {
      service
        .getAll({ page: 0, size: 10, filters: { alias: 'admin', activo: 'true' } })
        .subscribe();
      const req = httpMock.expectOne(
        (r) => r.url === `${environment.apiUrl}/ajustes/destinatarios-notificacion-email`,
      );
      expect(req.request.params.get('alias')).toBe('admin');
      expect(req.request.params.get('activo')).toBe('true');
      req.flush(emptyPage);
    });

    it('envía sortField y sortOrder en mayúsculas cuando se proporcionan', () => {
      service
        .getAll({ page: 0, size: 10, filters: {}, sortField: 'alias', sortOrder: 'desc' })
        .subscribe();
      const req = httpMock.expectOne(
        (r) => r.url === `${environment.apiUrl}/ajustes/destinatarios-notificacion-email`,
      );
      expect(req.request.params.get('sortField')).toBe('alias');
      expect(req.request.params.get('sortOrder')).toBe('DESC');
      req.flush(emptyPage);
    });

    it('omite sortField y sortOrder cuando sortField no se proporciona', () => {
      service.getAll({ page: 0, size: 10, filters: {}, sortOrder: 'asc' }).subscribe();
      const req = httpMock.expectOne(
        (r) => r.url === `${environment.apiUrl}/ajustes/destinatarios-notificacion-email`,
      );
      expect(req.request.params.has('sortField')).toBe(false);
      expect(req.request.params.has('sortOrder')).toBe(false);
      req.flush(emptyPage);
    });
  });

  describe('getById', () => {
    it('hace GET a /ajustes/destinatarios-notificacion-email/{id}', () => {
      service.getById(1).subscribe();
      const req = httpMock.expectOne(
        `${environment.apiUrl}/ajustes/destinatarios-notificacion-email/1`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockDestinatario);
    });

    it('propaga error 404 DESTINATARIO_NO_ENCONTRADO cuando el id no existe', () => {
      let errorStatus = 0;
      service.getById(9999).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/ajustes/destinatarios-notificacion-email/9999`)
        .flush(
          { codigo: 'DESTINATARIO_NO_ENCONTRADO', descripcion: 'Destinatario no encontrado.' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });
  });

  describe('create', () => {
    const dto = { email: 'nuevo@cipolflo.com', alias: 'Nuevo' };

    it('hace POST a /ajustes/destinatarios-notificacion-email con el DTO', () => {
      service.create(dto).subscribe();
      const req = httpMock.expectOne(
        `${environment.apiUrl}/ajustes/destinatarios-notificacion-email`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockDestinatario);
    });

    it('propaga error 400 EMAIL_DUPLICADO cuando el email ya existe', () => {
      let error: { status: number; error: { codigo: string } } | undefined;
      service.create(dto).subscribe({ error: (e) => (error = e) });
      httpMock
        .expectOne(`${environment.apiUrl}/ajustes/destinatarios-notificacion-email`)
        .flush(
          { codigo: 'EMAIL_DUPLICADO', descripcion: 'Ya existe un destinatario con ese email.' },
          { status: 400, statusText: 'Bad Request' },
        );
      expect(error?.status).toBe(400);
      expect(error?.error.codigo).toBe('EMAIL_DUPLICADO');
    });
  });

  describe('update', () => {
    it('hace PUT a /ajustes/destinatarios-notificacion-email/{id} sin el email', () => {
      service.update(1, { alias: 'Tesorería' }).subscribe();
      const req = httpMock.expectOne(
        `${environment.apiUrl}/ajustes/destinatarios-notificacion-email/1`,
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ alias: 'Tesorería' });
      req.flush({ ...mockDestinatario, alias: 'Tesorería' });
    });

    it('propaga error 404 cuando el id no existe', () => {
      let errorStatus = 0;
      service.update(9999, { alias: 'X' }).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/ajustes/destinatarios-notificacion-email/9999`)
        .flush(
          { codigo: 'DESTINATARIO_NO_ENCONTRADO', descripcion: 'Destinatario no encontrado.' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });
  });

  describe('actualizarHabilitacion', () => {
    it('hace PATCH a /ajustes/destinatarios-notificacion-email/{id}/habilitacion', () => {
      service.actualizarHabilitacion(1, { activo: false }).subscribe();
      const req = httpMock.expectOne(
        `${environment.apiUrl}/ajustes/destinatarios-notificacion-email/1/habilitacion`,
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ activo: false });
      req.flush({ ...mockDestinatario, activo: false });
    });
  });

  describe('eliminar', () => {
    it('hace DELETE a /ajustes/destinatarios-notificacion-email/{id}', () => {
      service.eliminar(1).subscribe();
      const req = httpMock.expectOne(
        `${environment.apiUrl}/ajustes/destinatarios-notificacion-email/1`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('propaga error 404 cuando el id no existe', () => {
      let errorStatus = 0;
      service.eliminar(9999).subscribe({ error: (e) => (errorStatus = e.status) });
      httpMock
        .expectOne(`${environment.apiUrl}/ajustes/destinatarios-notificacion-email/9999`)
        .flush(
          { codigo: 'DESTINATARIO_NO_ENCONTRADO', descripcion: 'Destinatario no encontrado.' },
          { status: 404, statusText: 'Not Found' },
        );
      expect(errorStatus).toBe(404);
    });
  });
});
