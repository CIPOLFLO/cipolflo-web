import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FileDownloadService } from './file-download.service';

describe('FileDownloadService', () => {
  let service: FileDownloadService;
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileDownloadService);

    createObjectURLSpy = vi.fn().mockReturnValue('blob:test');
    revokeObjectURLSpy = vi.fn();

    vi.stubGlobal('URL', {
      createObjectURL: createObjectURLSpy,
      revokeObjectURL: revokeObjectURLSpy,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('descarga el archivo usando el nombre de Content-Disposition', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    const response = new HttpResponse({
      body: new Blob(['contenido']),
      headers: new HttpHeaders({
        'Content-Disposition': 'attachment; filename="finanzas.xlsx"',
      }),
    });

    service.download(response, 'fallback.xlsx');

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');

    clickSpy.mockRestore();
  });

  it('usa fallback cuando no hay Content-Disposition', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    const response = new HttpResponse({
      body: new Blob(['contenido']),
    });

    service.download(response, 'finanzas.xlsx');

    expect(clickSpy).toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');

    clickSpy.mockRestore();
  });

  it('parsea error blob JSON', async () => {
    const blob = new Blob([JSON.stringify({ codigo: 'SIN_REGISTROS', descripcion: 'Sin datos' })], {
      type: 'application/json',
    });

    const error = new HttpErrorResponse({
      error: blob,
      status: 400,
      statusText: 'Bad Request',
    });

    await expect(firstValueFrom(service.parseBlobError(error))).rejects.toMatchObject({
      error: { codigo: 'SIN_REGISTROS', descripcion: 'Sin datos' },
      status: 400,
    });
  });
  it('descarga el archivo usando filename UTF-8 de Content-Disposition', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');

    const response = new HttpResponse({
      body: new Blob(['contenido']),
      headers: new HttpHeaders({
        'Content-Disposition': "attachment; filename*=UTF-8''finanzas%20junio.xlsx",
      }),
    });

    service.download(response, 'fallback.xlsx');

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');

    clickSpy.mockRestore();
  });

  it('devuelve el error original cuando no es Blob', async () => {
    const error = new HttpErrorResponse({
      error: { codigo: 'ERROR', descripcion: 'Error común' },
      status: 500,
      statusText: 'Server Error',
    });

    await expect(firstValueFrom(service.parseBlobError(error))).rejects.toBe(error);
  });
});
