import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private observer = inject(BreakpointObserver);

  isMobile = toSignal(
    this.observer.observe('(max-width: 767px)').pipe(map((result) => result.matches)),
    { initialValue: false },
  );
}
