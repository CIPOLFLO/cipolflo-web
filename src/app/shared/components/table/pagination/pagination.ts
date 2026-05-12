import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AppButton } from '../../button/button';

@Component({
  selector: 'app-pagination',
  imports: [AppButton],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  page = input.required<number>();
  pageSize = input.required<number>();
  totalElements = input.required<number>();
  pageSizeOptions = input<number[]>([10, 25, 50, 100]);

  pageChange = output<number>();
  pageSizeChange = output<number>();

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalElements() / this.pageSize())),
  );

  protected readonly firstItem = computed(() =>
    this.totalElements() === 0 ? 0 : this.page() * this.pageSize() + 1,
  );

  protected readonly lastItem = computed(() =>
    Math.min((this.page() + 1) * this.pageSize(), this.totalElements()),
  );

  // Muestra máximo 7 slots: [1] [...] [cur-1] [cur] [cur+1] [...] [last]
  // Si hay 7 o menos páginas, se muestran todas sin puntos.
  // La elipsis izquierda aparece cuando la página actual está a más de 2 posiciones del inicio.
  protected readonly visiblePages = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    const current = this.page() + 1;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (current > 3) pages.push('...');

    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push('...');

    pages.push(total);

    return pages;
  });

  protected goTo(p: number): void {
    if (p >= 0 && p < this.totalPages()) {
      this.pageChange.emit(p);
    }
  }

  protected onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(value);
  }

  protected isEllipsis(item: number | string): item is '...' {
    return item === '...';
  }
}
