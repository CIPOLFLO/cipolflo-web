import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { MOBILE_BREAKPOINT_QUERY } from './breakpoint.constants';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  private observer = inject(BreakpointObserver);

  isMobile = toSignal(
    this.observer.observe(MOBILE_BREAKPOINT_QUERY).pipe(map((result) => result.matches)),
    { initialValue: false },
  );
}
