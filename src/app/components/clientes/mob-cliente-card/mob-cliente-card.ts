import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppTag, MobListCard, RowAction } from '../../../shared';
import { CedulaFormatPipe } from '../pipes/cedula-format.pipe';
import { ClienteCardMobileRow } from '../mappers/cliente-listado.mapper';
import { ClienteRespuestaDto } from '../models/cliente.model';

/**
 * Card de un cliente en el listado móvil. Presentacional: recibe la fila ya mapeada
 * y las acciones, y compone el shell genérico `app-mob-list-card`.
 */
@Component({
  selector: 'app-mob-cliente-card',
  imports: [MobListCard, AppTag, CedulaFormatPipe],
  templateUrl: './mob-cliente-card.html',
  styleUrl: './mob-cliente-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobClienteCard {
  cliente = input.required<ClienteCardMobileRow>();
  // Sin acciones por defecto: el shell oculta el menú (⋮) cuando la lista está vacía.
  actions = input<RowAction<ClienteRespuestaDto>[]>([]);
}
