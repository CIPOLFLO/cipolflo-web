import { inject, Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.service';
import { ErrorHandlerService } from './error-handler.service';
import { from, Observable, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FileDownloadService extends BaseHttpService {
  private readonly errorHandler = inject(ErrorHandlerService);

  download(path: string, body: unknown, fallbackFilename: string): Observable<void> {
    return this.postBlob(path, body).pipe(
      switchMap((response) => {
        if (!response.body) return throwError(() => new Error('Respuesta vacía'));

        const filename = this.extractFilename(
          response.headers.get('Content-Disposition'),
          fallbackFilename,
        );
        this.triggerDownload(response.body, filename);
        return new Observable<void>((obs) => {
          obs.next();
          obs.complete();
        });
      }),
    );
  }

  handleBlobError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse && error.error instanceof Blob) {
      return from(error.error.text()).pipe(
        switchMap((text) => {
          try {
            const parsed = JSON.parse(text);
            const syntheticError = new HttpErrorResponse({
              error: parsed,
              status: error.status,
              statusText: error.statusText,
            });
            this.errorHandler.handle(syntheticError);
          } catch {
            this.errorHandler.handle(error);
          }
          return throwError(() => error);
        }),
      );
    }
    this.errorHandler.handle(error);
    return throwError(() => error);
  }

  private extractFilename(disposition: string | null, fallback: string): string {
    if (!disposition) return fallback;
    const match = disposition.match(/filename="?([^"]+)"?/);
    return match?.[1] ?? fallback;
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
