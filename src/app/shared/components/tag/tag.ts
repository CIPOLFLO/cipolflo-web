import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Tag reutilizable: aplica los estilos globales `.app-tag` + `.tag--*` (los mismos que la
 * tabla de escritorio). Presentacional: recibe la clase de color ya resuelta, un tamaño y
 * un ícono opcional, y proyecta la etiqueta con `<ng-content>`.
 */
@Component({
  selector: 'app-tag',
  imports: [],
  template: `@if (icon(); as icon) {
      <i [class]="icon"></i>
    }
    <ng-content />`,
  host: { '[class]': 'hostClasses()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTag {
  /** Clase de color de la tag (p. ej. `tag--green`), compartida con la tabla de escritorio. */
  colorClass = input.required<string>();
  /** Tamaño: `md` (por defecto, como la tabla) o `sm` (compacto, para cards mobile). */
  size = input<'md' | 'sm'>('md');
  /** Ícono opcional (`pi pi-*`) antes del contenido. */
  icon = input<string>();

  protected readonly hostClasses = computed(
    () => `app-tag ${this.colorClass()}${this.size() === 'sm' ? ' app-tag--sm' : ''}`,
  );
}
