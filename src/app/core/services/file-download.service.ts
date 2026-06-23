import { Injectable } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, from, switchMap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileDownloadService {
  download(response: HttpResponse<Blob>, fallbackFileName: string): void {
    const disposition = response.headers.get('content-disposition');

    const fileName =
      disposition?.match(/filename\*=UTF-8''([^;]+)/)?.[1] ??
      disposition?.match(/filename="?([^"]+)"?/)?.[1] ??
      fallbackFileName;

    const blob = response.body;
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = decodeURIComponent(fileName);

    document.body.appendChild(link);
    link.click();

    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 0);
  }

  parseBlobError(error: HttpErrorResponse): Observable<never> {
    if (!(error.error instanceof Blob)) {
      return throwError(() => error);
    }

    return from(error.error.text()).pipe(
      switchMap((text) => {
        try {
          const parsed = JSON.parse(text);

          return throwError(
            () =>
              new HttpErrorResponse({
                error: parsed,
                headers: error.headers,
                status: error.status,
                statusText: error.statusText,
                url: error.url ?? undefined,
              }),
          );
        } catch {
          return throwError(() => error);
        }
      }),
    );
  }
}
