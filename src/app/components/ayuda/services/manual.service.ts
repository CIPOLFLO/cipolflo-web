import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { BlobExportService } from '../../../core/services/blob-export.service';
import { ManualResponseDto } from '../models/manual.model';

@Injectable({ providedIn: 'root' })
export class ManualService extends BaseHttpService {
  private readonly blobExport = inject(BlobExportService);

  getManuales(): Observable<ManualResponseDto[]> {
    return this.get<ManualResponseDto[]>('manuales');
  }

  /**
   * Descarga el PDF del manual. El nombre real llega en el `Content-Disposition`;
   * el título visible se usa solo como fallback.
   */
  descargar(clave: string, titulo: string): Observable<void> {
    return this.blobExport.download(`manuales/${clave}`, `${titulo}.pdf`, { descargar: true });
  }
}
