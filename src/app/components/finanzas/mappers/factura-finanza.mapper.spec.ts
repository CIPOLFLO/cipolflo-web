import { Procedencia } from '../../../shared';
import { DocumentoAnalizadoResponse } from '../../documentos/models/document-intelligence.model';
import { Concepto, TipoMovimiento } from '../models/finanza.model';
import { mapFacturaToFinanza } from './factura-finanza.mapper';

describe('mapFacturaToFinanza', () => {
  it('debería mapear una factura UTE a finanza', () => {
    const result = mapFacturaToFinanza(
      crearDocumento(
        'ute\nNº de Factura\nT 9719044\nFecha de Emisión\n29/05/2026\nIMPORTE TOTAL\n$3.203,00',
      ),
    );

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
    expect(mapFacturaToFinanza(crearDocumento('ANTEL\nIMPORTE TOTAL\n$1.000,00')).concepto).toBe(
      Concepto.Antel,
    );
  });

  it('debería detectar OSE', () => {
    expect(mapFacturaToFinanza(crearDocumento('OSE\nIMPORTE TOTAL\n$1.000,00')).concepto).toBe(
      Concepto.Ose,
    );
  });

  it('debería detectar Barraca', () => {
    expect(mapFacturaToFinanza(crearDocumento('BARRACA\nIMPORTE TOTAL\n$1.000,00')).concepto).toBe(
      Concepto.Barraca,
    );
  });

  it('debería usar OTRO cuando no detecta proveedor conocido', () => {
    expect(mapFacturaToFinanza(crearDocumento('Proveedor desconocido')).concepto).toBe(
      Concepto.Otro,
    );
  });

  it('debería usar fecha de emisión para conceptos que no sean UTE/OSE/ANTEL', () => {
    const result = mapFacturaToFinanza(
      crearDocumento('BARRACA\nFecha de Emisión\n12/06/2026\nIMPORTE TOTAL\n$500,00'),
    );

    expect(result.fecha).toBe('2026-06-12');
  });

  it('debería usar fecha de hoy si no encuentra fecha de emisión', () => {
    const hoy = new Date().toISOString().slice(0, 10);

    expect(mapFacturaToFinanza(crearDocumento('Proveedor desconocido')).fecha).toBe(hoy);
  });

  it('debería parsear importe sin decimales', () => {
    expect(mapFacturaToFinanza(crearDocumento('BARRACA\nIMPORTE TOTAL\n$1.234')).importe).toBe(
      1234,
    );
  });

  it('debería detectar número de factura en misma línea', () => {
    const result = mapFacturaToFinanza(
      crearDocumento('BARRACA\nNº de Factura T 9719044\nIMPORTE TOTAL\n$500,00'),
    );

    expect(result.notas).toContain('T 9719044');
  });

  it('debería detectar número de factura con formato argentino con guiones', () => {
    const result = mapFacturaToFinanza(
      crearDocumento('BARRACA\nNº de Factura\nA-0001-00012345\nIMPORTE TOTAL\n$500,00'),
    );

    expect(result.notas).toContain('A-0001-00012345');
  });

  it('debería retornar importe undefined si no encuentra IMPORTE TOTAL', () => {
    expect(mapFacturaToFinanza(crearDocumento('Sin importe')).importe).toBeUndefined();
  });

  it('debería manejar resultadoJson malformado sin lanzar error', () => {
    const documento: DocumentoAnalizadoResponse = {
      id: 1,
      nombreArchivo: 'factura.pdf',
      tipoContenido: 'application/pdf',
      modeloUsado: 'prebuilt-invoice',
      fechaAnalisis: '2026-06-25T10:00:00Z',
      resultadoJson: 'json inválido {{{',
    };

    expect(() => mapFacturaToFinanza(documento)).not.toThrow();
    expect(mapFacturaToFinanza(documento).importe).toBeUndefined();
  });
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
