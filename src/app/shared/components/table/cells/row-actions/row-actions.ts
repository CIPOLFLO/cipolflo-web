import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  input,
  signal,
} from '@angular/core';
import { Button } from 'primeng/button';
import { RowAction } from '../../table.models';

@Component({
  selector: 'app-row-actions',
  imports: [Button],
  templateUrl: './row-actions.html',
  styleUrl: './row-actions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowActionsComponent<T> {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private pendingTimeout: ReturnType<typeof setTimeout> | null = null;

  actions = input.required<RowAction<T>[]>();
  row = input.required<T>();

  protected isOpen = signal(false);
  protected dropdownPos = signal({ top: 0, left: 0 });

  protected menuItems = computed(() =>
    this.actions().map((action) => ({
      label: action.label,
      icon: action.icon,
      separator: action.separator,
      disabled:
        typeof action.disabled === 'function'
          ? action.disabled(this.row())
          : (action.disabled ?? false),
      command: action.command
        ? (): void => {
            this.close();
            action.command!(this.row());
          }
        : undefined,
    })),
  );

  constructor() {
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  protected toggle(event: Event): void {
    if (this.isOpen()) {
      this.close();
    } else {
      const btn = event.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      this.dropdownPos.set({ top: rect.bottom + 4, left: rect.right });
      this.isOpen.set(true);
      this.document.addEventListener('scroll', this.onScrollOrResize, true);
      window.addEventListener('resize', this.onScrollOrResize);
      this.pendingTimeout = setTimeout(() =>
        this.document.addEventListener('click', this.onDocumentClick),
      );
    }
  }

  protected close(): void {
    this.isOpen.set(false);
    this.cleanup();
  }

  private readonly onDocumentClick = (): void => this.close();
  private readonly onScrollOrResize = (): void => this.close();

  private cleanup(): void {
    if (this.pendingTimeout !== null) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
    this.document.removeEventListener('click', this.onDocumentClick);
    this.document.removeEventListener('scroll', this.onScrollOrResize, true);
    window.removeEventListener('resize', this.onScrollOrResize);
  }
}
