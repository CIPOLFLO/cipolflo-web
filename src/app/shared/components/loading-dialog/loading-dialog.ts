import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { AppButton } from '../button/button';

@Component({
  selector: 'app-loading-dialog',
  standalone: true,
  imports: [CommonModule, AppButton],
  templateUrl: './loading-dialog.html',
  styleUrl: './loading-dialog.css',
})
export class LoadingDialog {
  readonly visible = input(false);

  readonly title = input('Procesando');

  readonly message = input('Espere unos instantes mientras se completa la operación.');

  readonly cancelLabel = input('Cancelar');

  readonly showCancel = input(true);

  readonly cancelled = output<void>();

  protected onCancel(): void {
    this.cancelled.emit();
  }
}
