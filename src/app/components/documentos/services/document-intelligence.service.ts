import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';

export interface DocumentoAnalizadoResponse {
  id: number;
  nombreArchivo: string;
  tipoContenido: string;
  modeloUsado: string;
  fechaAnalisis: string;
  resultadoJson: string;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentIntelligenceService extends BaseHttpService {
  analizarFactura(file: File): Observable<DocumentoAnalizadoResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<DocumentoAnalizadoResponse>(
      'documentos/analizar-factura',
      formData,
    );
  }
}