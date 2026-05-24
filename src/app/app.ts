import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/layout/header/header';
import { Footer } from './shared/layout/footer/footer';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { AuthService } from '@auth0/auth0-angular';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, ConfirmDialogComponent,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly window = window;
  protected auth = inject(AuthService);
}
