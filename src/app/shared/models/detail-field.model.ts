export interface DetailFieldConfig {
  key: string;
  label: string;
  value: string | null;
  fullWidth?: boolean;
  multiline?: boolean;
}

export interface DetailRegistroData {
  entityId: string;
  entityIdLabel?: string;
  fechaRegistro: string;
  registradoPor: string;
}
