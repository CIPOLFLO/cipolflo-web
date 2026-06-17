import { Injectable, signal } from '@angular/core';

/**
 * Estado compartido del sidebar mobile. Permite que el botón de menú
 * (renderizado por página en mob-page-header) y el sidebar (instancia única
 * en app.html, fuera del router-outlet) se coordinen aunque vivan en
 * componentes distintos.
 */
@Injectable({ providedIn: 'root' })
export class SidebarService {
  readonly isVisible = signal(false);

  open(): void {
    this.isVisible.set(true);
  }

  close(): void {
    this.isVisible.set(false);
  }
}
