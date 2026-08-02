import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Tooltip } from 'primeng/tooltip';
import { PageLayout } from '../../../shared';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import {
  ManualItem,
  SeccionManuales,
  mapSeccionesManuales,
} from '../mappers/manual-secciones.mapper';
import { ManualService } from '../services/manual.service';

@Component({
  standalone: true,
  selector: 'app-ayuda',
  imports: [PageLayout, Tooltip],
  templateUrl: './ayuda.html',
  styleUrl: './ayuda.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Ayuda {
  private readonly manualService = inject(ManualService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly secciones = signal<SeccionManuales[]>([]);
  protected readonly cargando = signal(true);
  /** Clave del manual que se está descargando, o `null` si no hay descarga en curso. */
  protected readonly descargando = signal<string | null>(null);

  constructor() {
    this.manualService
      .getManuales()
      .pipe(map(mapSeccionesManuales), takeUntilDestroyed())
      .subscribe({
        next: (secciones) => {
          this.secciones.set(secciones);
          this.cargando.set(false);
        },
        error: (error) => {
          this.cargando.set(false);
          this.errorHandler.handle(error);
        },
      });
  }

  protected descargar(manual: ManualItem): void {
    if (!manual.disponible || this.descargando()) return;

    this.descargando.set(manual.clave);
    this.manualService
      .descargar(manual.clave, manual.titulo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.descargando.set(null),
        error: (error) => {
          this.descargando.set(null);
          this.errorHandler.handle(error);
        },
      });
  }
}
