import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-verificando-reservas-dialog',
  standalone: true,
  imports: [Dialog, ProgressSpinner],
  templateUrl: './verificando-reservas-dialog.html',
  styleUrl: './verificando-reservas-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificandoReservasDialog {
  visible = input<boolean>(false);
  nombreServicio = input<string>('');
}
