import { TestBed } from '@angular/core/testing';
import { TableStateService } from './table-state.service';

describe('TableStateService', () => {
  let service: TableStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TableStateService],
    });

    service = TestBed.inject(TableStateService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('setResult actualiza totalElements y hasResults', () => {
    service.setResult(5);

    expect(service.totalElements()).toBe(5);
    expect(service.hasResults()).toBe(true);
  });

  it('hasResults es false cuando totalElements es 0', () => {
    service.setResult(0);

    expect(service.totalElements()).toBe(0);
    expect(service.hasResults()).toBe(false);
  });

  it('setLoading actualiza loading', () => {
    service.setLoading(true);
    expect(service.loading()).toBe(true);

    service.setLoading(false);
    expect(service.loading()).toBe(false);
  });
});
