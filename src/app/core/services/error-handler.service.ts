import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ConfirmDialogService } from '../../shared';
import { ErrorResponse } from '../models/error-response.model';
import { ERROR_CODES } from '../config/error-codes';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private readonly dialog = inject(ConfirmDialogService);

  handle(error: unknown): void {
    this.dialog.open({
      title: 'Error',
      message: this.resolveMessage(error),
      variant: 'danger',
      showCancelButton: false,
      confirmButtonLabel: 'Cerrar',
    });
  }

  private resolveMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as Partial<ErrorResponse> | null;

      if (body?.codigo && body.descripcion) {
        return ERROR_CODES[body.codigo] ?? body.descripcion;
      }
    }

    return 'Ocurrió un error inesperado. Por favor, intentá de nuevo.';
  }
}
