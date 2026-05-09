import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogData, ConfirmDialogVariant } from './confirm-dialog.model';
import { AppButton } from '../layout/components/button/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [Dialog, ButtonModule, AppButton],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  visible = false;
  config: ConfirmDialogData = { title: '', message: '' };

  protected subscription: Subscription = new Subscription(); // ✅ protected para el test

  constructor(private confirmDialogService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.subscription = this.confirmDialogService.dialogState$.subscribe((config) => {
      this.config = config;
      this.visible = true;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onConfirm(): void {
    this.visible = false;
    this.confirmDialogService.confirm();
  }

  onCancel(): void {
    this.visible = false;
    this.confirmDialogService.cancel();
  }

  get confirmVariant(): ConfirmDialogVariant {
    return this.config.variant ?? 'primary';
  }

  
}