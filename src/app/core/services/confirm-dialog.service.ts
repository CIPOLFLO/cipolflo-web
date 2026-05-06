import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmDialogData } from '../../servicios/models/confirm-dialog.model';
@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {

private dialogStateSubject = new Subject<ConfirmDialogData>();
private confirmSubject = new Subject<boolean>();

readonly dialogState$ = this.dialogStateSubject.asObservable();
open(config:ConfirmDialogData): Observable<boolean> {
  this.dialogStateSubject.next(config);
  return this.confirmSubject.asObservable();
}

confirm():void{
  this.confirmSubject.next(true);
}

cancel():void{
  this.confirmSubject.next(false);
}
}
