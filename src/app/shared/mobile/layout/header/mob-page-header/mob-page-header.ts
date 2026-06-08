import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { UserService } from '../../../../../core/services/user.service';

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
  menuToggled = output<void>();

  protected readonly userService = inject(UserService);

  onMenuClick(): void {
    this.menuToggled.emit();
  }
}
