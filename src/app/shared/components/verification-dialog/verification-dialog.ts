import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-verification-dialog',
  standalone: true,
  imports: [Dialog, ProgressSpinner],
  templateUrl: './verification-dialog.html',
  styleUrl: './verification-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationDialog {
  visible = input<boolean>(false);
  title = input<string>('Verificando');
  message = input<string>('Estamos verificando la información.');
}
