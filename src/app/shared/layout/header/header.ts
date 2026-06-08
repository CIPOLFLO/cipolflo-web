import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { AsyncPipe } from '@angular/common';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  auth = inject(AuthService);
  protected readonly userService = inject(UserService);

  logout() {
    this.auth.logout({ logoutParams: { returnTo: window.location.origin } });
  }
}
