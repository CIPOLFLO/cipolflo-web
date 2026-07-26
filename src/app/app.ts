import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/layout/header/header';
import { Footer } from './shared/layout/footer/footer';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';
import { BreakpointService } from './core/services/breakpoint.service';
import { SidebarService } from './core/services/sidebar.service';
import { UserService } from './core/services/user.service';
import { InactivityService } from './core/services/inactivity.service';
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
export class App implements OnInit {
  protected readonly window = window;
  protected auth = inject(AuthService);
  protected readonly breakpoint = inject(BreakpointService);
  protected readonly sidebar = inject(SidebarService);
  protected readonly userService = inject(UserService);
  private readonly inactivityService = inject(InactivityService);

  protected readonly orgName = 'Círculo Policial';
  protected readonly orgInitials = 'CP';
  protected readonly orgSubtitle = 'de Flores';

  protected readonly navItems: NavItem[] = [
    { label: 'Reservas', route: '/reservas', icon: 'pi pi-calendar' },
    { label: 'Clientes', route: '/clientes', icon: 'pi pi-users' },
    { label: 'Finanzas', route: '/finanzas', icon: 'pi pi-wallet' },
    { label: 'Servicios', route: '/servicios', icon: 'pi pi-building' },
    { label: 'Ajustes', route: '/ajustes', icon: 'pi pi-cog' },
  ];

  public ngOnInit(): void {
    this.inactivityService.iniciar();
  }

  protected onLogout(): void {
    this.sidebar.close();
    this.auth.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }
}
