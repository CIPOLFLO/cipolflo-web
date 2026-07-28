import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { AppButton } from '../../../shared';
import { FilaErrorImportacionDto } from '../models/importacion-socios.model';

@Component({
  selector: 'app-importar-clientes-error-dialog',
  standalone: true,
  imports: [Dialog, AppButton],
  templateUrl: './importar-clientes-error-dialog.html',
  styleUrl: './importar-clientes-error-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportarClientesErrorDialog {
  visible = input<boolean>(false);
  errores = input<FilaErrorImportacionDto[]>([]);

  aceptar = output<void>();
  reintentar = output<void>();
}
