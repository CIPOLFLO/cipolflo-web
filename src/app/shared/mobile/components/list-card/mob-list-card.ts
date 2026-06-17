import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RowActionsComponent } from '../../../components/table/cells/row-actions/row-actions';
import { RowAction } from '../../../components/table/table.models';

@Component({
  selector: 'app-mob-list-card',
  imports: [RowActionsComponent],
  templateUrl: './mob-list-card.html',
  styleUrl: './mob-list-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobListCard<T> {
  actions = input.required<RowAction<T>[]>();
  row = input.required<T>();
}
