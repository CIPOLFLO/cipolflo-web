import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/layout/header/header';
import { Footer } from './shared/layout/footer/footer';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { BreakpointService } from './core/services/breakpoint.service';
import { SidebarService } from './core/services/sidebar.service';
import { UserService } from './core/services/user.service';
import { ErrorDialogComponent } from './shared/error-dialog/error-dialog';
import { MobSidebar } from './shared/mobile/layout/sidebar/mob-sidebar';
import { NavItem } from './shared/models/nav-item.model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    Footer,
    ErrorDialogComponent,
    ConfirmDialogComponent,
    CommonModule,
    MobSidebar,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly window = window;
  protected auth = inject(AuthService);
  protected readonly breakpoint = inject(BreakpointService);
  protected readonly sidebar = inject(SidebarService);
  protected readonly userService = inject(UserService);

  protected readonly orgName = 'Círculo Policial';
  protected readonly orgInitials = 'CP';
  protected readonly orgSubtitle = 'de Flores';

  // Finanzas y Ajustes no tienen vista mobile implementada: se excluyen del menú
  // mobile (el acceso directo por URL se bloquea con mobileNotImplementedGuard).
  protected readonly navItems: NavItem[] = [
    { label: 'Reservas', route: '/reservas', icon: 'pi pi-calendar' },
    { label: 'Clientes', route: '/clientes', icon: 'pi pi-users' },
    { label: 'Servicios', route: '/servicios', icon: 'pi pi-building' },
  ];

  protected onLogout(): void {
    this.sidebar.close();
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }
}
