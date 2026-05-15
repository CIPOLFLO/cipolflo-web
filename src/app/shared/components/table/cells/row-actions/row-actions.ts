import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input, signal } from '@angular/core';
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

  actions = input.required<RowAction<T>[]>();
  row = input.required<T>();

  protected isOpen = signal(false);
  protected dropdownPos = signal({ top: 0, left: 0 });

  protected toggle(event: Event): void {
    event.stopPropagation();
    if (this.isOpen()) {
      this.close();
    } else {
      const btn = event.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      this.dropdownPos.set({ top: rect.bottom + 4, left: rect.right });
      this.isOpen.set(true);
      setTimeout(() => this.document.addEventListener('click', this.onDocumentClick));
    }
  }

  protected close(): void {
    this.isOpen.set(false);
    this.document.removeEventListener('click', this.onDocumentClick);
  }

  private readonly onDocumentClick = (): void => this.close();

  protected execute(action: RowAction<T>): void {
    this.close();
    action.command?.(this.row());
  }

  protected isDisabled(action: RowAction<T>): boolean {
    return typeof action.disabled === 'function' ? action.disabled(this.row()) : (action.disabled ?? false);
  }
}
