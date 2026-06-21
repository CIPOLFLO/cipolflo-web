import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { environment } from '@env/environment';

import { FileDownloadService } from './file-download.service';
import { ErrorHandlerService } from './error-handler.service';

describe('FileDownloadService', () => {
  let service: FileDownloadService;
  let httpMock: HttpTestingController;
  let errorHandler: { handle: ReturnType<typeof vi.fn> };
  let clickSpy: ReturnType<typeof vi.fn>;
  let anchorMock: Partial<HTMLAnchorElement>;

  const expectedUrl = `${environment.apiUrl}/clientes/export`;

  beforeEach(() => {
    errorHandler = { handle: vi.fn() };
    clickSpy = vi.fn();
    anchorMock = { href: '', download: '', click: clickSpy as unknown as () => void };

    vi.spyOn(document, 'createElement').mockReturnValue(anchorMock as HTMLAnchorElement);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    });

    service = TestBed.inject(FileDownloadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  describe('download', () => {
    it('descarga exitosa: hace POST con responseType blob y dispara click con el nombre del header', async () => {
      const promise = firstValueFrom(
        service.download('clientes/export', { filtro: 'x' }, 'fallback.xlsx'),
      );

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.responseType).toBe('blob');
      expect(req.request.body).toEqual({ filtro: 'x' });

      const blob = new Blob(['contenido'], { type: 'application/octet-stream' });
      req.flush(blob, {
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders({ 'Content-Disposition': 'attachment; filename="clientes.xlsx"' }),
      });

      await promise;

      expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(anchorMock.download).toBe('clientes.xlsx');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('usa el fallback cuando no hay header Content-Disposition', async () => {
      const promise = firstValueFrom(service.download('clientes/export', {}, 'clientes.xlsx'));

      httpMock.expectOne(expectedUrl).flush(new Blob(['x']), { status: 200, statusText: 'OK' });

      await promise;

      expect(anchorMock.download).toBe('clientes.xlsx');
    });

    it('soporta filename sin comillas en el header', async () => {
      const promise = firstValueFrom(service.download('clientes/export', {}, 'fallback.xlsx'));

      httpMock.expectOne(expectedUrl).flush(new Blob(['x']), {
        status: 200,
        statusText: 'OK',
        headers: new HttpHeaders({ 'Content-Disposition': 'attachment; filename=reporte.xlsx' }),
      });

      await promise;

      expect(anchorMock.download).toBe('reporte.xlsx');
    });

    it('libera el object URL tras disparar la descarga', async () => {
      const promise = firstValueFrom(service.download('clientes/export', {}, 'clientes.xlsx'));

      httpMock.expectOne(expectedUrl).flush(new Blob(['x']), { status: 200, statusText: 'OK' });

      await promise;

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('falla si la respuesta no trae body', async () => {
      const promise = firstValueFrom(service.download('clientes/export', {}, 'clientes.xlsx'));

      httpMock.expectOne(expectedUrl).flush(null, { status: 200, statusText: 'OK' });

      await expect(promise).rejects.toThrow('Respuesta vacía');
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleBlobError', () => {
    it('parsea el blob de error y llama a errorHandler.handle con el cuerpo parseado', async () => {
      const blobBody = new Blob([
        JSON.stringify({ codigo: 'LIMITE_FILAS', descripcion: 'Demasiados registros' }),
      ]);
      const error = new HttpErrorResponse({
        error: blobBody,
        status: 422,
        statusText: 'Unprocessable Entity',
      });

      await expect(firstValueFrom(service.handleBlobError(error))).rejects.toBe(error);

      expect(errorHandler.handle).toHaveBeenCalledTimes(1);
      const calledWith = errorHandler.handle.mock.calls[0][0] as HttpErrorResponse;
      expect(calledWith.error).toEqual({
        codigo: 'LIMITE_FILAS',
        descripcion: 'Demasiados registros',
      });
      expect(calledWith.status).toBe(422);
    });

    it('si el blob no es JSON válido, delega el error original a errorHandler.handle', async () => {
      const blobBody = new Blob(['no es json']);
      const error = new HttpErrorResponse({
        error: blobBody,
        status: 500,
        statusText: 'Server Error',
      });

      await expect(firstValueFrom(service.handleBlobError(error))).rejects.toBe(error);

      expect(errorHandler.handle).toHaveBeenCalledWith(error);
    });

    it('si el error no trae un Blob, llama a errorHandler.handle directamente', async () => {
      const error = new HttpErrorResponse({
        error: { codigo: 'X' },
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(firstValueFrom(service.handleBlobError(error))).rejects.toBe(error);

      expect(errorHandler.handle).toHaveBeenCalledWith(error);
    });

    it('si el error no es HttpErrorResponse, igual lo delega a errorHandler.handle', async () => {
      const error = new Error('fallo de red');

      await expect(firstValueFrom(service.handleBlobError(error))).rejects.toBe(error);

      expect(errorHandler.handle).toHaveBeenCalledWith(error);
    });
  });
});
