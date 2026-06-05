import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { ErrorDialogComponent } from './error-dialog';
import { ErrorDialogData } from './error-dialog.model';
import { ErrorDialogService } from './error-dialog.service';

const mockConfig: ErrorDialogData = {
  title: 'Error',
  message: 'Ocurrió un error inesperado.',
  confirmButtonLabel: 'Cerrar',
};

class MockErrorDialogService {
  private readonly dialogStateSubject = new Subject<ErrorDialogData>();

  readonly dialogState$ = this.dialogStateSubject.asObservable();

  open(config: ErrorDialogData): void {
    this.dialogStateSubject.next(config);
  }
}

describe('ErrorDialogComponent', () => {
  let component: ErrorDialogComponent;
  let fixture: ComponentFixture<ErrorDialogComponent>;
  let service: MockErrorDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorDialogComponent],
      providers: [{ provide: ErrorDialogService, useClass: MockErrorDialogService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorDialogComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ErrorDialogService) as unknown as MockErrorDialogService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with visible false', () => {
      expect(component['visible']()).toBe(false);
    });

    it('should start with default config', () => {
      expect(component['config']().title).toBe('Error');
      expect(component['config']().message).toBe('');
      expect(component['config']().confirmButtonLabel).toBe('Cerrar');
    });
  });

  describe('when service emits', () => {
    it('should set visible to true', () => {
      service.open(mockConfig);

      expect(component['visible']()).toBe(true);
    });

    it('should update config with emitted data', () => {
      service.open(mockConfig);

      expect(component['config']().title).toBe(mockConfig.title);
      expect(component['config']().message).toBe(mockConfig.message);
      expect(component['config']().confirmButtonLabel).toBe(mockConfig.confirmButtonLabel);
    });

    it('should use default title and button label when not provided', () => {
      service.open({ message: 'Mensaje sin título' });

      expect(component['config']().title).toBe('Error');
      expect(component['config']().message).toBe('Mensaje sin título');
      expect(component['config']().confirmButtonLabel).toBe('Cerrar');
    });
  });

  describe('onClose', () => {
    it('should set visible to false', () => {
      service.open(mockConfig);

      component['onClose']();

      expect(component['visible']()).toBe(false);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe on destroy', () => {
      const spy = vi.spyOn(component['subscription'], 'unsubscribe');

      component.ngOnDestroy();

      expect(spy).toHaveBeenCalled();
    });

    it('should stop reacting after destroy', () => {
      component.ngOnDestroy();

      service.open(mockConfig);

      expect(component['visible']()).toBe(false);
    });
  });
});
