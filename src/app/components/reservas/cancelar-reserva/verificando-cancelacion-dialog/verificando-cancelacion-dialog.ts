import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-verificando-cancelacion-dialog',
  standalone: true,
  imports: [Dialog, ProgressSpinner],
  templateUrl: './verificando-cancelacion-dialog.html',
  styleUrl: './verificando-cancelacion-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificandoCancelacionDialog {
  visible = input<boolean>(false);
  numeroReserva = input<number | null>(null);
}
