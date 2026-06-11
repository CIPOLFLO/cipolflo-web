import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'mob-fab',
  imports: [],
  templateUrl: './mob-fab.html',
  styleUrl: './mob-fab.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobFab {
  clicked = output<void>();

  protected handleClick(): void {
    this.clicked.emit();
  }
}
