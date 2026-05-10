import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { ConfirmDialogComponent } from './confirm-dialog';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogData } from './confirm-dialog.model';

const mockConfig: ConfirmDialogData = {
  title: 'Dar de baja a socio',
  message: '¿Está seguro que desea dar de baja a este socio?',
  cancelButtonLabel: 'Cancelar',
  variant: 'danger',
};

class MockConfirmDialogService {
  private dialogStateSubject = new Subject<ConfirmDialogData>();
  dialogState$ = this.dialogStateSubject.asObservable();

  open(config: ConfirmDialogData) {
    this.dialogStateSubject.next(config);
  }
  confirm = vi.fn();
  cancel = vi.fn();
}

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let service: MockConfirmDialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: ConfirmDialogService, useClass: MockConfirmDialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(ConfirmDialogService) as unknown as MockConfirmDialogService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with visible false', () => {
      expect(component.visible).toBe(false);
    });

    it('should start with empty config', () => {
      expect(component.config.title).toBe('');
      expect(component.config.message).toBe('');
    });
  });

  describe('when service emits', () => {
    it('should set visible to true', () => {
      service.open(mockConfig);
      expect(component.visible).toBe(true);
    });

    it('should update config with emitted data', () => {
      service.open(mockConfig);
      expect(component.config.title).toBe(mockConfig.title);
      expect(component.config.message).toBe(mockConfig.message);
    });
  });

  describe('onConfirm', () => {
    it('should set visible to false', () => {
      component.visible = true;
      component.onConfirm();
      expect(component.visible).toBe(false);
    });

    it('should call service.confirm()', () => {
      component.onConfirm();
      expect(service.confirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('onCancel', () => {
    it('should set visible to false', () => {
      component.visible = true;
      component.onCancel();
      expect(component.visible).toBe(false);
    });

    it('should call service.cancel()', () => {
      component.onCancel();
      expect(service.cancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirmVariant', () => {
    it('should use variant when provided', () => {
      component.config = { ...mockConfig, variant: 'danger' };
      expect(component.confirmVariant).toBe('danger'); // ✅
    });

    it('should use default variant when not provided', () => {
      component.config = { title: 'T', message: 'M' };
      expect(component.confirmVariant).toBe('primary'); // ✅
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
      expect(component.visible).toBe(false);
    });
  });
});