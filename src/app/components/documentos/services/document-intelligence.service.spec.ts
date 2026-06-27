import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DocumentIntelligenceService } from './document-intelligence.service';
import { DocumentoAnalizadoResponse } from '../models/document-intelligence.model';

describe('DocumentIntelligenceService', () => {
  let service: DocumentIntelligenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentIntelligenceService);
  });

  it('deberia crearse', () => {
    expect(service).toBeTruthy();
  });

  it('deberia enviar una factura para analizar', () => {
    const response: DocumentoAnalizadoResponse = {
      id: 1,
      nombreArchivo: 'factura.pdf',
      tipoContenido: 'application/pdf',
      modeloUsado: 'prebuilt-invoice',
      fechaAnalisis: '2026-06-25T10:00:00Z',
      resultadoJson: '{}',
    };

    const response$ = of(response);

    const postSpy = vi
      .spyOn(
        service as unknown as {
          post: (url: string, body: FormData) => typeof response$;
        },
        'post',
      )
      .mockReturnValue(response$);

    const file = new File(['contenido'], 'factura.pdf', { type: 'application/pdf' });

    service.analizarFactura(file).subscribe((result) => {
      expect(result).toEqual(response);
    });

    expect(postSpy).toHaveBeenCalledWith('documentos/analizar-factura', expect.any(FormData));
  });
});
