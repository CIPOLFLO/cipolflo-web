import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Drawer } from 'primeng/drawer';
import { NavItem } from './sidebar.models';

@Component({
  standalone: true,
  selector: 'app-mob-sidebar',
  imports: [Drawer, RouterLink, RouterLinkActive],
  templateUrl: './mob-sidebar.html',
  styleUrl: './mob-sidebar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobSidebar {
  visible = input.required<boolean>();

  orgName = input.required<string>();
  orgInitials = input.required<string>();
  orgSubtitle = input<string>('');

  userName = input.required<string>();
  userEmail = input.required<string>();
  userInitials = input.required<string>();

  navItems = input.required<NavItem[]>();

  closed = output<void>();
  logoutClicked = output<void>();

  protected onLogoutClick(): void {
    this.logoutClicked.emit();
  }
}
