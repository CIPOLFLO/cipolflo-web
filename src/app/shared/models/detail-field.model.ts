export interface DetailFieldConfig {
  key: string;
  label: string;
  value: string | null;
  fullWidth?: boolean;
  multiline?: boolean;
  valueClass?: string;
}

export interface DetailRegistroData {
  entityId: string;
  entityIdLabel?: string;
  fechaRegistro: string;
  registradoPor: string;
}
