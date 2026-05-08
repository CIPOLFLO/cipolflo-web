export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  fullWidth?: boolean;
  disabled?: boolean;
  defaultValue?: string;
}
