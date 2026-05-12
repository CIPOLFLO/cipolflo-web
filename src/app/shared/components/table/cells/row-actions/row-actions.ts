import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Menu } from 'primeng/menu';
import { Button } from 'primeng/button';
import { RowAction } from '../../table.models';

@Component({
  selector: 'app-row-actions',
  imports: [Menu, Button],
  templateUrl: './row-actions.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowActionsComponent<T> {
  actions = input.required<RowAction<T>[]>();
  row = input.required<T>();

  protected menuItems = computed(() =>
    this.actions().map((action) => ({
      label: action.label,
      icon: action.icon,
      disabled:
        typeof action.disabled === 'function' ? action.disabled(this.row()) : action.disabled,
      separator: action.separator,
      command: action.command ? () => action.command!(this.row()) : undefined,
    })),
  );
}
