import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, EMPTY, finalize } from 'rxjs';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

/**
 * Ofrece descargar un comprobante tras una operación exitosa (alta/modificación). El diálogo
 * y la descarga (fire-and-forget, catchError -> ErrorHandlerService) quedan atados a
 * `destroyRef`; si quien lo abrió se destruye (navegación) antes de que el usuario responda,
 * el diálogo global se cierra explícitamente en vez de quedar huérfano.
 */
export function ofrecerComprobante(
  confirmDialog: ConfirmDialogService,
  errorHandler: ErrorHandlerService,
  destroyRef: DestroyRef,
  config: { title: string; message: string },
  descargar$: () => Observable<void>,
  onCerrado?: () => void,
): void {
  let respondido = false;
  confirmDialog
    .open({
      title: config.title,
      message: config.message,
      confirmButtonLabel: 'Descargar comprobante',
      cancelButtonLabel: 'No, gracias',
      variant: 'success',
    })
    .pipe(
      takeUntilDestroyed(destroyRef),
      finalize(() => {
        if (!respondido) confirmDialog.close();
      }),
    )
    .subscribe((descargar) => {
      respondido = true;
      if (descargar) {
        descargar$()
          .pipe(
            catchError((err: unknown) => {
              errorHandler.handle(err);
              return EMPTY;
            }),
          )
          .subscribe();
      }
      onCerrado?.();
    });
}
