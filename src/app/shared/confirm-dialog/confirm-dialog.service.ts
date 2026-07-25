import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmDialogData } from './confirm-dialog.model';
@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  private readonly dialogStateSubject = new Subject<ConfirmDialogData>();
  private readonly closeSubject = new Subject<void>();
  private confirmSubject: Subject<boolean> | null = null;

  readonly dialogState$ = this.dialogStateSubject.asObservable();
  /** El componente visual del diálogo se suscribe para ocultarse en un cierre no iniciado por el usuario. */
  readonly close$ = this.closeSubject.asObservable();

  open(config: ConfirmDialogData): Observable<boolean> {
    this.confirmSubject?.next(false);
    this.confirmSubject?.complete();
    this.confirmSubject = new Subject<boolean>();
    this.dialogStateSubject.next(config);
    return this.confirmSubject.asObservable();
  }

  confirm(): void {
    this.confirmSubject?.next(true);
    this.confirmSubject?.complete();
    this.confirmSubject = null;
  }

  cancel(): void {
    this.confirmSubject?.next(false);
    this.confirmSubject?.complete();
    this.confirmSubject = null;
  }

  /**
   * Cierra el diálogo sin resolver una respuesta. Lo usa quien lo abrió cuando se destruye
   * (p. ej. el usuario navega a otra pantalla) antes de que el usuario responda, para no dejar
   * el diálogo global huérfano visible sobre la pantalla nueva.
   */
  close(): void {
    this.confirmSubject?.complete();
    this.confirmSubject = null;
    this.closeSubject.next();
  }
}
