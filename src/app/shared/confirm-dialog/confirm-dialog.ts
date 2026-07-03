import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogData, ConfirmDialogVariant } from './confirm-dialog.model';
import { AppButton } from '../components/button/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [Dialog, AppButton],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  // Signals (no campos planos): al abrirse el diálogo tras una respuesta HTTP en una app
  // zoneless, mutar signals programa la detección de cambios; un campo plano no lo haría.
  readonly visible = signal(false);
  readonly config = signal<ConfirmDialogData>({ title: '', message: '' });

  protected subscription: Subscription = new Subscription();

  private readonly confirmDialogService = inject(ConfirmDialogService);

  ngOnInit(): void {
    this.subscription = this.confirmDialogService.dialogState$.subscribe((config) => {
      this.config.set(config);
      this.visible.set(true);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onConfirm(): void {
    this.visible.set(false);
    this.confirmDialogService.confirm();
  }

  onCancel(): void {
    this.visible.set(false);
    this.confirmDialogService.cancel();
  }

  get confirmVariant(): ConfirmDialogVariant {
    return this.config().variant ?? 'primary';
  }
}
