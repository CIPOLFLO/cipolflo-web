import { inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export abstract class BaseHttpService {
  protected readonly http = inject(HttpClient);
  protected readonly apiUrl = environment.apiUrl;

  protected get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${path}`, { params: this.buildParams(params) });
  }

  protected post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${path}`, body);
  }

  protected put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${path}`, body);
  }

  protected patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${path}`, body);
  }

  protected delete<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${path}`, { params: this.buildParams(params) });
  }

  protected postBlob(path: string, body: unknown): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/${path}`, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  protected getBlob(
    path: string,
    params?: Record<string, unknown>,
  ): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/${path}`, {
      params: this.buildParams(params),
      responseType: 'blob',
      observe: 'response',
    });
  }

  private buildParams(params?: Record<string, unknown>): HttpParams | undefined {
    return params
      ? new HttpParams({
          fromObject: Object.fromEntries(
            Object.entries(params)
              .filter(([, v]) => v != null)
              .map(([k, v]) => [k, String(v)]),
          ),
        })
      : undefined;
  }
}
