import { Component,OnDestroy,OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {Dialog} from 'primeng/dialog'
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { ConfirmDialogData } from '../../../servicios/models/confirm-dialog.model';


@Component({
  selector: 'app-confirm-dialog',
  imports: [Dialog, ButtonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})


export class ConfirmDialogComponent implements OnInit, OnDestroy {
  visible = false;
  config: ConfirmDialogData = { title: '', message: '' };


  private subscription: Subscription = new Subscription();
  
  constructor(private confirmDialogService: ConfirmDialogService) {}

  ngOnInit(): void {
    this.subscription = this.confirmDialogService.dialogState$.subscribe((config) => {
      this.config = config;
      this.visible = true;
    })};

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

  get confirmButtonStyle(): { [key: string]: string } {
    return {
      'background-color': this.config.confirmButtonColor ?? '#ef4444',
      'border-color': this.config.confirmButtonColor ?? '#ef4444',
    };
  }

  get cancelButtonStyle(): { [key: string]: string } {
    return {
      'background-color': this.config.cancelButtonColor ?? 'transparent',
      'border-color': 'transparent',
      color: this.config.cancelButtonTextColor ?? '#374151',
    };
  }
  


  }