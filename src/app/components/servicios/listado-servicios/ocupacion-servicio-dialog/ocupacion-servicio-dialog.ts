import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { AppButton, OccupancyCalendar, OccupiedRange } from '../../../../shared';

@Component({
  selector: 'app-ocupacion-servicio-dialog',
  standalone: true,
  imports: [Dialog, AppButton, OccupancyCalendar],
  templateUrl: './ocupacion-servicio-dialog.html',
  styleUrl: './ocupacion-servicio-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OcupacionServicioDialog {
  readonly visible = input<boolean>(false);
  readonly nombreServicio = input<string>('');
  readonly occupiedRanges = input<OccupiedRange[]>([]);

  readonly cerrar = output<void>();
}
