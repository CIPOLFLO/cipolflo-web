import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';
import { ButtonIntent, ButtonType } from './button.models';

@Component({
  selector: 'app-button',
  imports: [Tooltip],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppButton {
  label = input<string>('');
  intent = input<ButtonIntent>('primary');
  icon = input<string>('');
  disabled = input<boolean>(false);
  type = input<ButtonType>('button');
  tooltip = input<string>('');

  clicked = output<MouseEvent>();

  protected handleClick(event: MouseEvent): void {
    this.clicked.emit(event);
  }
}
