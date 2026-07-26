import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CurrencyFormatPipe, DateShortFormatPipe } from '../../../shared';
import { FORMA_PAGO_RESERVA_LABEL, PagoAsociadoReservaDto } from '../models/reserva.model';

@Component({
  selector: 'app-historial-pagos-section',
  standalone: true,
  imports: [CurrencyFormatPipe, DateShortFormatPipe],
  templateUrl: './historial-pagos-section.html',
  styleUrl: './historial-pagos-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialPagosSection {
  readonly pagos = input<PagoAsociadoReservaDto[]>([]);

  protected readonly formaPagoReservaLabel = FORMA_PAGO_RESERVA_LABEL;
}
