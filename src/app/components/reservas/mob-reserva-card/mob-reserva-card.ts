import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppTag, CurrencyFormatPipe, MobListCard, RowAction } from '../../../shared';
import { ReservaCardMobileRow } from '../mappers/reserva-card-mobile.mapper';
import { ReservaRow } from '../models/reserva.model';

@Component({
  selector: 'app-mob-reserva-card',
  standalone: true,
  imports: [MobListCard, AppTag, CurrencyFormatPipe],
  templateUrl: './mob-reserva-card.html',
  styleUrl: './mob-reserva-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobReservaCard {
  reserva = input.required<ReservaCardMobileRow>();

  // Sin acciones por ahora: si la lista queda vacía,
  // MobListCard no muestra el menú de tres puntos.
  actions = input<RowAction<ReservaRow>[]>([]);
}
