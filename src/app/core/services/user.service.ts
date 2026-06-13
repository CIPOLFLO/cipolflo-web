// src/app/core/services/user.service.ts

import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@auth0/auth0-angular';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly auth = inject(AuthService);

  userInitials = toSignal(
    this.auth.user$.pipe(
      map((user) => {
        const name = user?.name ?? '';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        }
        return parts[0].charAt(0).toUpperCase();
      }),
    ),
    { initialValue: '' },
  );
  userEmail = toSignal(this.auth.user$.pipe(map((user) => user?.email ?? '')), {
    initialValue: '',
  });
}
