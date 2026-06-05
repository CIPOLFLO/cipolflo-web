import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-mob-page-header',
  imports: [],
  templateUrl: './mob-page-header.html',
  styleUrl: './mob-page-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobPageHeader {
  title = input.required<string>();
  subtitle = input<string>('');
  userInitials = input<string>('');

  menuToggled = output<void>();
  onMenuClick(): void {
    this.menuToggled.emit();
  }
}
