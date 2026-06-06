import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ErrorDialogData } from './error-dialog.model';
import { ErrorDialogService } from './error-dialog.service';

const baseConfig: ErrorDialogData = {
  title: 'Error',
  message: 'Ocurrió un error inesperado.',
  confirmButtonLabel: 'Cerrar',
};

describe('ErrorDialogService', () => {
  let service: ErrorDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('open', () => {
    it('should emit config on dialogState$', async () => {
      const emitted = firstValueFrom(service.dialogState$);

      service.open(baseConfig);

      expect(await emitted).toEqual(baseConfig);
    });

    it('should emit on dialogState$ for each open()', () => {
      const emissions: ErrorDialogData[] = [];
      const sub = service.dialogState$.subscribe((config) => emissions.push(config));

      service.open(baseConfig);
      service.open({ title: 'Segundo error', message: 'Segundo mensaje' });

      sub.unsubscribe();

      expect(emissions.length).toBe(2);
      expect(emissions[0].title).toBe('Error');
      expect(emissions[1].title).toBe('Segundo error');
    });
  });
});
