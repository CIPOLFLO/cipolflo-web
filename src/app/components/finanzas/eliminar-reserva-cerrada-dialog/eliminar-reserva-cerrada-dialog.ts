import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { AppButton } from '../../../shared';

@Component({
  selector: 'app-eliminar-reserva-cerrada-dialog',
  standalone: true,
  imports: [Dialog, AppButton],
  templateUrl: './eliminar-reserva-cerrada-dialog.html',
  styleUrl: './eliminar-reserva-cerrada-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EliminarReservaCerradaDialog {
  visible = input<boolean>(false);
  message = input<string>('');
  procesando = input<boolean>(false);

  registrarEgreso = output<void>();
  eliminar = output<void>();
  cancelar = output<void>();
}
