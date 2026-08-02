import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { of } from 'rxjs';
import { environment } from '@env/environment';
import { ManualService } from './manual.service';
import { BlobExportService } from '../../../core/services/blob-export.service';
import { CategoriaManual, ManualResponseDto } from '../models/manual.model';

const MANUALES: ManualResponseDto[] = [
  {
    clave: 'clientes',
    titulo: 'Manual de Módulo Clientes',
    categoria: CategoriaManual.Usuario,
    disponible: true,
    version: '1.0',
    fechaActualizacion: '2026-07-31',
  },
  {
    clave: 'ajustes',
    titulo: 'Manual de Módulo Ajustes',
    categoria: CategoriaManual.Usuario,
    disponible: false,
    version: null,
    fechaActualizacion: null,
  },
];

describe('ManualService', () => {
  let service: ManualService;
  let httpMock: HttpTestingController;
  let blobExportService: { download: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    blobExportService = { download: vi.fn().mockReturnValue(of(undefined)) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BlobExportService, useValue: blobExportService },
        ManualService,
      ],
    });
    service = TestBed.inject(ManualService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getManuales', () => {
    it('hace GET a /manuales', () => {
      service.getManuales().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/manuales`);
      expect(req.request.method).toBe('GET');
      req.flush(MANUALES);
    });

    it('devuelve el catálogo tal cual lo manda el backend', () => {
      let resultado: ManualResponseDto[] | undefined;
      service.getManuales().subscribe((r) => (resultado = r));

      httpMock.expectOne(`${environment.apiUrl}/manuales`).flush(MANUALES);

      expect(resultado).toEqual(MANUALES);
    });

    it('propaga el error 401 sin transformarlo', () => {
      let status = 0;
      service.getManuales().subscribe({ error: (e) => (status = e.status) });

      httpMock
        .expectOne(`${environment.apiUrl}/manuales`)
        .flush(null, { status: 401, statusText: 'Unauthorized' });

      expect(status).toBe(401);
    });
  });

  describe('descargar', () => {
    it('delega en BlobExportService con la clave, el filename de fallback y descargar=true', () => {
      service.descargar('clientes', 'Manual de Módulo Clientes').subscribe();

      expect(blobExportService.download).toHaveBeenCalledWith(
        'manuales/clientes',
        'Manual de Módulo Clientes.pdf',
        { descargar: true },
      );
    });
  });
});
