export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'time' | 'select' | 'textarea' | 'currency';
  required?: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  fullWidth?: boolean;
  disabled?: boolean;
  locked?: boolean;
  defaultValue?: string;
  maxDate?: string;
  valueClass?: string;
}
