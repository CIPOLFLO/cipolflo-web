export interface FilaErrorImportacionDto {
  numeroFila: number;
  codigoError: string;
  motivo: string;
}

export interface ImportacionSociosResponseDto {
  totalFilas: number;
  filasImportadas: number;
  filasConError: number;
  detalleErrores: FilaErrorImportacionDto[];
}
