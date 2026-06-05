import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { BreakpointService } from './breakpoint.service';
import { BreakpointObserver } from '@angular/cdk/layout';
describe('BreakpointService', () => {
  let service: BreakpointService;
  let breakpointService: Subject<{ matches: boolean }>;

  beforeEach(() => {
    breakpointService = new Subject<{ matches: boolean }>();
    TestBed.configureTestingModule({
      providers: [
        BreakpointService,
        {
          provide: BreakpointObserver,
          useValue: { observe: () => breakpointService.asObservable() },
        },
      ],
    });
    service = TestBed.inject(BreakpointService);
  });

  it('should return true when viewport matches (max-width: 767px)', () => {
    TestBed.runInInjectionContext(() => {
      breakpointService.next({ matches: true });
    });

    expect(service.isMobile()).toBe(true);
  });

  it('should return false when viewport does not match (max-width: 767px)', () => {
    TestBed.runInInjectionContext(() => {
      breakpointService.next({ matches: false });
    });

    expect(service.isMobile()).toBe(false);
  });

  it('should default to false before any emission', () => {
    expect(service.isMobile()).toBe(false);
  });
});
