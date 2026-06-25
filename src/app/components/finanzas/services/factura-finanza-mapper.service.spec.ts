import { TestBed } from '@angular/core/testing';
import { Procedencia } from '../../../shared';
import { DocumentoAnalizadoResponse } from '../../documentos/models/document-intelligence.model';
import { Concepto, TipoMovimiento } from '../models/finanza.model';
import { FacturaFinanzaMapperService } from './factura-finanza-mapper.service';

describe('FacturaFinanzaMapperService', () => {
  let service: FacturaFinanzaMapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacturaFinanzaMapperService);
  });

  it('debería mapear una factura UTE a finanza', () => {
    const documento = crearDocumento(
      'ute\nNº de Factura\nT 9719044\nFecha de Emisión\n29/05/2026\nIMPORTE TOTAL\n$3.203,00',
    );

    const result = service.mapear(documento);

    expect(result).toEqual(
      expect.objectContaining({
        tipoMovimiento: TipoMovimiento.Egreso,
        procedencia: Procedencia.Ambos,
        concepto: Concepto.Ute,
        importe: 3203,
      }),
    );
    expect(result.notas).toContain('factura.pdf');
    expect(result.notas).toContain('T 9719044');
  });

  it('debería detectar ANTEL', () => {
    expect(service.mapear(crearDocumento('ANTEL\nIMPORTE TOTAL\n$1.000,00')).concepto).toBe(
      Concepto.Antel,
    );
  });

  it('debería detectar OSE', () => {
    expect(service.mapear(crearDocumento('OSE\nIMPORTE TOTAL\n$1.000,00')).concepto).toBe(
      Concepto.Ose,
    );
  });

  it('debería detectar Barraca', () => {
    expect(service.mapear(crearDocumento('BARRACA\nIMPORTE TOTAL\n$1.000,00')).concepto).toBe(
      Concepto.Barraca,
    );
  });

  it('debería usar OTRO cuando no detecta proveedor conocido', () => {
    expect(service.mapear(crearDocumento('Proveedor desconocido')).concepto).toBe(Concepto.Otro);
  });

  it('debería usar fecha de emisión para conceptos que no sean UTE/OSE/ANTEL', () => {
    const result = service.mapear(
      crearDocumento('BARRACA\nFecha de Emisión\n12/06/2026\nIMPORTE TOTAL\n$500,00'),
    );

    expect(result.fecha).toBe('2026-06-12');
  });

  it('debería usar fecha de hoy si no encuentra fecha de emisión', () => {
    const hoy = new Date().toISOString().slice(0, 10);

    const result = service.mapear(crearDocumento('Proveedor desconocido'));

    expect(result.fecha).toBe(hoy);
  });

  function crearDocumento(content: string): DocumentoAnalizadoResponse {
    return {
      id: 1,
      nombreArchivo: 'factura.pdf',
      tipoContenido: 'application/pdf',
      modeloUsado: 'prebuilt-invoice',
      fechaAnalisis: '2026-06-25T10:00:00Z',
      resultadoJson: JSON.stringify({ content }),
    };
  }
});
