
export type ConfirmDialogVariant = 'primary' | 'secondary' | 'danger' | 'success';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  showCancelButton?: boolean;
  width?: string;
  variant?: ConfirmDialogVariant;
}