export enum CategoriaManual {
  Usuario = 'USUARIO',
  Tecnico = 'TECNICO',
}

export const CATEGORIA_MANUAL_LABEL: Record<string, string> = {
  [CategoriaManual.Usuario]: 'Manuales de usuario',
  [CategoriaManual.Tecnico]: 'Documentación técnica',
};

/** Orden en que se muestran las secciones dentro de la página de ayuda. */
export const CATEGORIA_MANUAL_ORDEN: readonly CategoriaManual[] = [
  CategoriaManual.Usuario,
  CategoriaManual.Tecnico,
];

export interface ManualResponseDto {
  clave: string;
  titulo: string;
  categoria: CategoriaManual;
  /** `false` = declarado en el catálogo pero sin PDF publicado. */
  disponible: boolean;
  /** `null` cuando `disponible` es `false`. */
  version: string | null;
  /** Fecha ISO 'yyyy-MM-dd'; `null` cuando `disponible` es `false`. */
  fechaActualizacion: string | null;
}
