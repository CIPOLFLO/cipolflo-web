import type { FormFieldOption } from '../../../shared';

export interface CostoCuotaResponseDto {
  monto: number;
  updatedAt: string;
  updatedBy: string;
}

export interface CostoCuotaRequestDto {
  monto: number;
}

export interface AntiguedadReservasResponseDto {
  anios: number;
  updatedAt: string;
  updatedBy: string;
}

export interface AntiguedadReservasRequestDto {
  anios: number;
}

export interface RegistroClienteTelegramRequestDto {
  chatId: number;
  alias: string;
  recibeNotificaciones: boolean;
}

export interface ModificacionClienteTelegramRequestDto {
  alias: string;
  recibeNotificaciones: boolean;
}

export interface HabilitacionClienteTelegramRequestDto {
  activo: boolean;
}

export interface ClienteTelegramResponseDto extends Record<string, unknown> {
  id: number;
  chatId: number;
  alias: string;
  activo: boolean;
  recibeNotificaciones: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ACTIVO_OPTIONS: FormFieldOption[] = [
  { label: 'Todos', value: '' },
  { label: 'Activo', value: 'true' },
  { label: 'Inactivo', value: 'false' },
];
