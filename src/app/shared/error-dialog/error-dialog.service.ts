import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ErrorDialogData } from './error-dialog.model';

@Injectable({
  providedIn: 'root',
})
export class ErrorDialogService {
  private readonly dialogStateSubject = new Subject<ErrorDialogData>();

  readonly dialogState$ = this.dialogStateSubject.asObservable();

  open(config: ErrorDialogData): void {
    this.dialogStateSubject.next(config);
  }
}
