import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { throwError } from 'rxjs';
import { BlobExportService } from './blob-export.service';
import { FileDownloadService } from './file-download.service';

describe('BlobExportService', () => {
  let service: BlobExportService;
  let httpMock: HttpTestingController;
  let fileDownloadService: {
    download: ReturnType<typeof vi.fn>;
    parseBlobError: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    fileDownloadService = {
      download: vi.fn(),
      parseBlobError: vi.fn().mockImplementation((err) => throwError(() => err)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        BlobExportService,
        { provide: FileDownloadService, useValue: fileDownloadService },
      ],
    });

    service = TestBed.inject(BlobExportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('hace POST con responseType blob y llama download en éxito', () => {
    const filters = { concepto: 'PAGO_RESERVA' };

    service.export('finanzas/export', filters, 'finanzas.xlsx').subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'POST' &&
        request.url.includes('finanzas/export') &&
        request.responseType === 'blob',
    );
    expect(req.request.body).toEqual(filters);

    req.flush(new Blob(['excel']), {
      headers: { 'Content-Disposition': 'attachment; filename="finanzas.xlsx"' },
    });

    expect(fileDownloadService.download).toHaveBeenCalled();
    expect(fileDownloadService.parseBlobError).not.toHaveBeenCalled();
  });

  it('llama parseBlobError y re-lanza el error cuando el backend falla', async () => {
    const parsedError = new HttpErrorResponse({ error: { codigo: 'SIN_REGISTROS' }, status: 400 });
    fileDownloadService.parseBlobError.mockReturnValue(throwError(() => parsedError));

    const promise = firstValueFrom(service.export('finanzas/export', {}, 'finanzas.xlsx'));

    const req = httpMock.expectOne(
      (request) => request.method === 'POST' && request.url.includes('finanzas/export'),
    );
    req.flush(
      new Blob([JSON.stringify({ codigo: 'SIN_REGISTROS' })], { type: 'application/json' }),
      {
        status: 400,
        statusText: 'Bad Request',
      },
    );

    await expect(promise).rejects.toBe(parsedError);
    expect(fileDownloadService.parseBlobError).toHaveBeenCalled();
    expect(fileDownloadService.download).not.toHaveBeenCalled();
  });

  it('hace GET con responseType blob y llama download en éxito', () => {
    service.download('reservas/42/comprobante', 'comprobante-reserva-42.pdf').subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.method === 'GET' &&
        request.url.includes('reservas/42/comprobante') &&
        request.responseType === 'blob',
    );

    req.flush(new Blob(['pdf']), {
      headers: { 'Content-Disposition': 'attachment; filename="comprobante-reserva-42.pdf"' },
    });

    expect(fileDownloadService.download).toHaveBeenCalled();
    expect(fileDownloadService.parseBlobError).not.toHaveBeenCalled();
  });

  it('en GET llama parseBlobError y re-lanza el error cuando el backend falla', async () => {
    const parsedError = new HttpErrorResponse({ error: { codigo: 'RESERVA_NO_ENCONTRADA' } });
    fileDownloadService.parseBlobError.mockReturnValue(throwError(() => parsedError));

    const promise = firstValueFrom(
      service.download('reservas/99/comprobante', 'comprobante-reserva-99.pdf'),
    );

    const req = httpMock.expectOne(
      (request) => request.method === 'GET' && request.url.includes('reservas/99/comprobante'),
    );
    req.flush(new Blob([JSON.stringify({ codigo: 'RESERVA_NO_ENCONTRADA' })]), {
      status: 404,
      statusText: 'Not Found',
    });

    await expect(promise).rejects.toBe(parsedError);
    expect(fileDownloadService.parseBlobError).toHaveBeenCalled();
    expect(fileDownloadService.download).not.toHaveBeenCalled();
  });
});
