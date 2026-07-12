import { Injectable, inject } from '@angular/core';

import { ErrorDialogService } from '../../shared';
import { resolveErrorMessage } from '../config/error-codes';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  private readonly dialog = inject(ErrorDialogService);

  handle(error: unknown): void {
    this.dialog.open({
      title: 'Error',
      message: resolveErrorMessage(error),
      confirmButtonLabel: 'Cerrar',
    });
  }
}
