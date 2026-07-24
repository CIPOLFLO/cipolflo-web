import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { InlineAction } from '../../table.models';

@Component({
  selector: 'app-inline-row-actions',
  imports: [FormsModule, ToggleSwitch],
  templateUrl: './inline-row-actions.html',
  styleUrl: './inline-row-actions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineRowActionsComponent<T> {
  actions = input.required<InlineAction<T>[]>();
  row = input.required<T>();

  protected isDisabled(action: InlineAction<T>): boolean {
    const row = this.row();
    return typeof action.disabled === 'function'
      ? action.disabled(row)
      : (action.disabled ?? false);
  }

  protected onToggleChange(action: InlineAction<T>, checked: boolean): void {
    if (action.type === 'toggle') {
      action.onChange(this.row(), checked);
    }
  }

  protected isChecked(action: InlineAction<T>): boolean {
    return action.type === 'toggle' ? action.checked(this.row()) : false;
  }
}
