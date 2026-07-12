import { Directive, ElementRef, OnDestroy, OnInit, inject, output } from '@angular/core';

/**
 * Centinela de scroll infinito para listados móviles. Colocada sobre un elemento al
 * final de la lista, emite `scrolled` cada vez que ese elemento entra en el viewport
 * (usando `IntersectionObserver`), para que el consumidor pida la siguiente página.
 *
 * Renderizar el elemento anfitrión solo mientras haya más páginas: al quitarlo, la
 * directiva se destruye y el observer se desconecta.
 */
@Directive({
  selector: '[appMobInfiniteScroll]',
})
export class MobInfiniteScroll implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly scrolled = output<void>();

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    // Entornos sin IntersectionObserver (p. ej. jsdom en tests) simplemente no observan.
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.scrolled.emit();
      }
    });

    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
