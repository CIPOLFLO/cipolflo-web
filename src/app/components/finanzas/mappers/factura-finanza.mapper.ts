import { Procedencia } from '../../../shared';
import { DocumentoAnalizadoResponse } from '../../documentos/models/document-intelligence.model';
import {
  Concepto,
  FinanzaCrearDto,
  TipoMovimiento,
  CONCEPTO_KEYWORDS,
} from '../models/finanza.model';

export function mapFacturaToFinanza(
  documento: DocumentoAnalizadoResponse,
): Partial<FinanzaCrearDto> {
  let resultado: { content?: string };
  try {
    resultado = JSON.parse(documento.resultadoJson) as { content?: string };
  } catch {
    resultado = {};
  }

  const content: string = resultado.content ?? '';

  const importe = extraerImporteTotal(content);
  const numeroFactura = extraerNumeroFactura(content);
  const concepto = detectarConcepto(content);
  const fecha = obtenerFecha(concepto, content);
  const notas = obtenerNotas(documento.nombreArchivo, numeroFactura);

  return {
    tipoMovimiento: TipoMovimiento.Egreso,
    procedencia: Procedencia.Ambos,
    concepto,
    fecha,
    importe,
    notas,
  };
}

function extraerImporteTotal(content: string): number | undefined {
  const match = /IMPORTE TOTAL\s*\$?([\d.]+(?:,\d{0,2})?)/i.exec(content);
  if (!match?.[1]) return undefined;
  return Number(match[1].replaceAll('.', '').replace(',', '.'));
}

function extraerNumeroFactura(content: string): string | null {
  const match = /Nº de Factura\s+([A-Z](?:[\s-]?\d+)+)/i.exec(content);
  return match?.[1]?.replace(/\s+/g, ' ').trim() ?? null;
}

function detectarConcepto(content: string): Concepto {
  const texto = content.toUpperCase();
  return (
    CONCEPTO_KEYWORDS.find(({ keyword }) => texto.includes(keyword))?.concepto ?? Concepto.Otro
  );
}

function extraerFechaEmision(content: string): string | null {
  const match = /Fecha de Emisión\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i.exec(content);
  if (!match?.[1]) return null;
  const [dia, mes, anio] = match[1].split('/');
  return `${anio}-${mes}-${dia}`;
}

function obtenerFecha(concepto: Concepto, content: string): string {
  const fechaEmision = extraerFechaEmision(content);
  const fechaHoy = new Date().toISOString().slice(0, 10);
  const usaFechaActual = [Concepto.Ute, Concepto.Ose, Concepto.Antel].includes(concepto);
  return usaFechaActual || !fechaEmision ? fechaHoy : fechaEmision;
}

function obtenerNotas(nombreArchivo: string, numeroFactura: string | null): string {
  if (!numeroFactura) return `Factura cargada: ${nombreArchivo}`;
  return `Factura cargada: ${nombreArchivo} - Nº ${numeroFactura}`;
}
