import { Observable, catchError, EMPTY } from 'rxjs';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

export function ofrecerComprobante(
  confirmDialog: ConfirmDialogService,
  errorHandler: ErrorHandlerService,
  config: { title: string; message: string },
  descargar$: () => Observable<void>,
  onCerrado?: () => void,
): void {
  confirmDialog
    .open({
      title: config.title,
      message: config.message,
      confirmButtonLabel: 'Descargar comprobante',
      cancelButtonLabel: 'No, gracias',
      variant: 'success',
    })
    .subscribe((descargar) => {
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
