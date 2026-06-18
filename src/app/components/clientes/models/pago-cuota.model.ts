import { MetodoCobro } from './cliente.model';

export interface RegistroPagoCuotaRequestDto {
  cantidadCuotas: number;
  importeTotal: number;
  metodoCobro: MetodoCobro;
  fechaPago: string;
  observaciones: string | null;
}

export interface PagoCuotaResponseDto {
  id: number;
  socioId: number;
  anio: number;
  mes: number;
  nombreMes: string;
  descripcion: string;
  fechaPago: string;
  importe: number;
  metodoCobro: MetodoCobro;
}
