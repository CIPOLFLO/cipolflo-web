import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { FileDownloadService } from './file-download.service';

@Injectable({ providedIn: 'root' })
export class BlobExportService extends BaseHttpService {
  private readonly fileDownload = inject(FileDownloadService);

  export(path: string, body: unknown, fallbackFileName: string): Observable<void> {
    return this.postBlob(path, body).pipe(
      catchError((err) => this.fileDownload.parseBlobError(err)),
      tap((response) => this.fileDownload.download(response, fallbackFileName)),
      map(() => undefined),
    );
  }
}
