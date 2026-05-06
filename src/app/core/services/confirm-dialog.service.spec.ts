import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogData } from '../../servicios/models/confirm-dialog.model';

const baseConfig: ConfirmDialogData = {
  title: 'Eliminar Reserva',
  message: '¿Está seguro que desea eliminar esta reserva?',
  confirmButtonLabel: 'Eliminar',
  cancelButtonLabel: 'Cancelar',
};

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmDialogService);
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

    it('should return an Observable', () => {
      const result$ = service.open(baseConfig);
      expect(typeof result$.subscribe).toBe('function');
    });
  });

  describe('confirm', () => {
    it('should emit true', async () => {
      const result$ = service.open(baseConfig);
      const promise = firstValueFrom(result$);
      service.confirm();
      expect(await promise).toBe(true);
    });
  });

  describe('cancel', () => {
    it('should emit false', async () => {
      const result$ = service.open(baseConfig);
      const promise = firstValueFrom(result$);
      service.cancel();
      expect(await promise).toBe(false);
    });
  });

  describe('multiple calls', () => {
    it('should handle sequential open() calls', async () => {
      const promise1 = firstValueFrom(service.open(baseConfig));
      service.confirm();
      expect(await promise1).toBe(true);

      const promise2 = firstValueFrom(service.open({ title: 'Otro', message: 'Otro' }));
      service.cancel();
      expect(await promise2).toBe(false);
    });

    it('should emit on dialogState$ for each open()', async () => {
      const emissions: ConfirmDialogData[] = [];
      const sub = service.dialogState$.subscribe((c) => emissions.push(c));

      service.open(baseConfig);
      service.open({ title: 'Segundo', message: 'Segundo' });

      sub.unsubscribe();
      expect(emissions.length).toBe(2);
      expect(emissions[0].title).toBe('Eliminar Reserva');
      expect(emissions[1].title).toBe('Segundo');
    });
  });
});