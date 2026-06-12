import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router } from '@angular/router';
import { BreakpointService } from '../../../core/services/breakpoint.service';
import { UserService } from '../../../core/services/user.service';
import { MobPageHeader } from '../../mobile/layout/header/mob-page-header/mob-page-header';
import { MobSidebar } from '../../mobile/layout/sidebar/mob-sidebar';
import type { NavItem } from '../../mobile/layout/sidebar/sidebar.models';
import { SubHeader } from '../sub-header/sub-header';

@Component({
  selector: 'app-page-layout',
  imports: [SubHeader, MobPageHeader, MobSidebar],
  templateUrl: './page-layout.html',
  styleUrl: './page-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayout {
  pageTitle = input<string>('');
  pageDescription = input<string>('');
  showBackButton = input<boolean>(false);
  backButtonLink = input<string>('/');
  protected readonly breakpoint = inject(BreakpointService);
  protected readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isSidebarVisible = signal(false);

  protected readonly orgName = 'Círculo Policial';
  protected readonly orgInitials = 'CP';
  protected readonly orgSubtitle = 'de Flores';

  protected readonly navItems: NavItem[] = [
    { label: 'Reservas', route: '/reservas', icon: 'pi pi-calendar' },
    { label: 'Clientes', route: '/clientes', icon: 'pi pi-users' },
    { label: 'Estadísticas', route: '/estadisticas', icon: 'pi pi-chart-bar' },
    { label: 'Finanzas', route: '/finanzas', icon: 'pi pi-wallet' },
    { label: 'Servicios', route: '/servicios', icon: 'pi pi-building' },
  ];

  protected onLogout(): void {
    this.isSidebarVisible.set(false);
    this.authService.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }
}
