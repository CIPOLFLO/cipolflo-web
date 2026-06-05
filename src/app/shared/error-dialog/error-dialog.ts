import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Dialog } from 'primeng/dialog';
import { AppButton } from '../components/button/button';
import { ErrorDialogService } from './error-dialog.service';
import { ErrorDialogData } from './error-dialog.model';

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [Dialog, AppButton],
  templateUrl: './error-dialog.html',
  styleUrl: './error-dialog.css',
})
export class ErrorDialogComponent implements OnInit, OnDestroy {
  protected readonly visible = signal(false);
  protected readonly config = signal<ErrorDialogData>({
    title: 'Error',
    message: '',
    confirmButtonLabel: 'Cerrar',
  });

  private readonly errorDialogService = inject(ErrorDialogService);
  protected subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription = this.errorDialogService.dialogState$.subscribe((config) => {
      if (!config) {
        this.visible.set(false);
        return;
      }

      this.config.set({
        title: config.title ?? 'Error',
        message: config.message,
        confirmButtonLabel: config.confirmButtonLabel ?? 'Cerrar',
        width: config.width,
      });
      this.visible.set(true);
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  protected onClose(): void {
    this.visible.set(false);
  }
}
