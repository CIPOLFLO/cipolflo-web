import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-verificando-finalizacion-dialog',
  standalone: true,
  imports: [Dialog],
  templateUrl: './verificando-finalizacion-dialog.html',
  styleUrl: './verificando-finalizacion-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificandoFinalizacionDialog {
  visible = input<boolean>(false);
  numeroReserva = input<number | null>(null);
}
