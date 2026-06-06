import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Procedencia } from '../../../shared';
import { Concepto, FinanzaCrearDto, FormaPago, TipoMovimiento } from '../models/finanza.model';
import { FinanzaService } from './finanza.service';

const PARAMS_BASE = { page: 0, size: 10, filters: {} };

describe('FinanzaService', () => {
  let service: FinanzaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), FinanzaService],
    });
    service = TestBed.inject(FinanzaService);
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('retorna una página con 3 movimientos de placeholder', async () => {
      const result = await firstValueFrom(service.getAll(PARAMS_BASE));
      expect(result.totalElements).toBe(3);
      expect(result.content).toHaveLength(3);
    });

    it('refleja los parámetros de paginación recibidos', async () => {
      const result = await firstValueFrom(service.getAll({ page: 2, size: 5, filters: {} }));
      expect(result.page).toBe(2);
      expect(result.size).toBe(5);
    });

    it('el primer elemento tiene tipoMovimiento Ingreso', async () => {
      const result = await firstValueFrom(service.getAll(PARAMS_BASE));
      expect(result.content[0].tipoMovimiento).toBe(TipoMovimiento.Ingreso);
    });
  });

  describe('create', () => {
    it('retorna Observable<void> sin error', async () => {
      const dto: FinanzaCrearDto = {
        tipoMovimiento: TipoMovimiento.Ingreso,
        procedencia: Procedencia.Sede,
        concepto: Concepto.PagoReserva,
        fecha: '2026-01-15',
        importe: 1000,
        formaPago: FormaPago.Efectivo,
      };
      const result = await firstValueFrom(service.create(dto));
      expect(result).toBeUndefined();
    });
  });

  describe('getById', () => {
    it('retorna el detalle con el id recibido', async () => {
      const result = await firstValueFrom(service.getById(42));
      expect(result.id).toBe(42);
    });

    it('retorna el código de placeholder', async () => {
      const result = await firstValueFrom(service.getById(1));
      expect(result.codigo).toBe('FIN-2026-001');
    });

    it('retorna tipoMovimiento Ingreso', async () => {
      const result = await firstValueFrom(service.getById(1));
      expect(result.tipoMovimiento).toBe(TipoMovimiento.Ingreso);
    });
  });
});
