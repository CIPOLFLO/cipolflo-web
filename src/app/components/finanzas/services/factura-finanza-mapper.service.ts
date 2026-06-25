import { Injectable } from '@angular/core';
import { Procedencia } from '../../../shared';
import { DocumentoAnalizadoResponse } from '../../documentos/models/document-intelligence.model';
import {
  Concepto,
  FinanzaCrearDto,
  TipoMovimiento,
  CONCEPTO_KEYWORDS,
} from '../models/finanza.model';

@Injectable({
  providedIn: 'root',
})
export class FacturaFinanzaMapperService {
  mapear(documento: DocumentoAnalizadoResponse): Partial<FinanzaCrearDto> {
    const resultado = JSON.parse(documento.resultadoJson);
    const content: string = resultado.content ?? '';

    const importe = this.extraerImporteTotal(content);
    const numeroFactura = this.extraerNumeroFactura(content);
    const concepto = this.detectarConcepto(content);
    const fecha = this.obtenerFecha(concepto, content);
    const notas = this.obtenerNotas(documento.nombreArchivo, numeroFactura);

    return {
      tipoMovimiento: TipoMovimiento.Egreso,
      procedencia: Procedencia.Ambos,
      concepto,
      fecha,
      importe,
      notas,
    };
  }

  private extraerImporteTotal(content: string): number | undefined {
    const match = /IMPORTE TOTAL\s*\$?([\d.]+,\d{2})/i.exec(content);

    if (!match?.[1]) return undefined;

    return Number(match[1].replaceAll('.', '').replace(',', '.'));
  }

  private extraerNumeroFactura(content: string): string | null {
    const match = /Nº de Factura[\s\S]*?\n([A-Z]\s*\d+)/i.exec(content);

    return match?.[1]?.replace(/\s+/g, ' ') ?? null;
  }

  private detectarConcepto(content: string): Concepto {
    const texto = content.toUpperCase();

    return (
      CONCEPTO_KEYWORDS.find(({ keyword }) => texto.includes(keyword))?.concepto ?? Concepto.Otro
    );
  }

  private extraerFechaEmision(content: string): string | null {
    const match = /Fecha de Emisión\s+([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i.exec(content);

    if (!match?.[1]) return null;

    const [dia, mes, anio] = match[1].split('/');
    return `${anio}-${mes}-${dia}`;
  }

  private obtenerFecha(concepto: Concepto, content: string): string {
    const fechaEmision = this.extraerFechaEmision(content);
    const fechaHoy = new Date().toISOString().slice(0, 10);
    const usaFechaActual = [Concepto.Ute, Concepto.Ose, Concepto.Antel].includes(concepto);

    return usaFechaActual || !fechaEmision ? fechaHoy : fechaEmision;
  }

  private obtenerNotas(nombreArchivo: string, numeroFactura: string | null): string {
    if (!numeroFactura) {
      return `Factura cargada: ${nombreArchivo}`;
    }

    return `Factura cargada: ${nombreArchivo} - Nº ${numeroFactura}`;
  }
}
