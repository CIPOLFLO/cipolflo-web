import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppTag, CurrencyFormatPipe, MobListCard, RowAction } from '../../../shared';
import { ServicioCardMobileRow } from '../mappers/servicio-card-mobile.mapper';

@Component({
  selector: 'app-mob-servicio-card',
  standalone: true,
  imports: [MobListCard, AppTag, CurrencyFormatPipe],
  templateUrl: './mob-servicio-card.html',
  styleUrl: './mob-servicio-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobServicioCard {
  servicio = input.required<ServicioCardMobileRow>();

  actions = input<RowAction<ServicioCardMobileRow>[]>([]);
}
