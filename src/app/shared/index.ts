// Layout
export { PageLayout } from './layout/page-layout/page-layout';
export { Header } from './layout/header/header';
export { Footer } from './layout/footer/footer';
export { SubHeader } from './layout/sub-header/sub-header';

// UI Components
export { AppButton } from './components/button/button';
export type { ButtonIntent, ButtonType, IconPosition } from './components/button/button.models';
export { FilterPanel } from './components/filter-panel/filter-panel';
export { DetailSection } from './components/detail-section/detail-section';
export { DetailRegistroSection } from './components/detail-registro-section/detail-registro-section';
export { OccupancyCalendar } from './components/occupancy-calendar/occupancy-calendar';
export type {
  OccupiedRange,
  DateRangeSelection,
} from './components/occupancy-calendar/occupancy-calendar.models';
export * from './components/loading-dialog/loading-dialog';
export { VerificationDialog } from './components/verification-dialog/verification-dialog';
// Form Components
export { FormLayout } from './components/form-layout/form-layout';
export { FormSection } from './components/form-section/form-section';
export { FormField } from './components/form-field/form-field';
export { FormActions } from './components/form-actions/form-actions';

// Table
export { AppTable } from './components/table/table';
export { TableStateService } from './components/table/table-state.service';
export { TableExportService } from './components/table/table-export.service';
export type {
  ColumnConfig,
  CellType,
  TagStyle,
  PageResponse,
  TableQueryParams,
  RowAction,
  LoadDataFn,
} from './components/table/table.models';
export { EMPTY_PAGE } from './components/table/table.models';

// Confirm Dialog
export { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog';
export { ConfirmDialogService } from './confirm-dialog/confirm-dialog.service';
export type {
  ConfirmDialogData,
  ConfirmDialogVariant,
} from './confirm-dialog/confirm-dialog.model';

// error-dialog
export { ErrorDialogComponent } from './error-dialog/error-dialog';
export { ErrorDialogService } from './error-dialog/error-dialog.service';
export type { ErrorDialogData } from './error-dialog/error-dialog.model';

// Models
export type { FormFieldConfig, FormFieldOption } from './models/form-field.model';
export type { DetailFieldConfig, DetailRegistroData } from './models/detail-field.model';
export { Procedencia, PROCEDENCIA_LABEL, PROCEDENCIA_OPTIONS } from './models/procedencia.model';
export type { AuditInfoDto } from './models/audit.model';
export {
  EstadoReserva,
  ESTADO_RESERVA_LABEL,
  ESTADO_RESERVA_VALUE_CLASS,
} from './models/estado-reserva.model';
export { MESES_ABREVIADOS } from './models/fecha.constants';
export type { NavItem } from './models/nav-item.model';

// Pipes
export { DateTimeFormatPipe } from './pipes/date-time-format.pipe';
export { CurrencyFormatPipe } from './pipes/currency-format.pipe';
export { DateShortFormatPipe } from './pipes/date-short-format.pipe';

// Services
export { FilterConfigProvider } from './services/filter-config.provider';

// Utils
export { applySectionChange, markFieldAsTouched } from './utils/form-section.helper';
export { parseNumberOrNull } from './utils/parse-number.helper';
export { parseIsoDate, startOfToday, toDisplayDate, toIsoDate } from './utils/date.helper';

// Validators
export { emailValido } from './validators/email.validator';

// Tag
export { AppTag } from './components/tag/tag';

//Mobile Layout
export { MobPageHeader } from './mobile/layout/header/mob-page-header/mob-page-header';
export { MobSidebar } from './mobile/layout/sidebar/mob-sidebar';

// Mobile Components
export { MobStepper } from './mobile/components/stepper/mob-stepper';
export type { StepConfig } from './mobile/components/stepper/stepper.models';
export { MobStepCard } from './mobile/components/step-card/mob-step-card';
export { MobStepFooter } from './mobile/components/step-footer/mob-step-footer';
export { MobFab } from './mobile/components/fab/mob-fab';
export { MobListCard } from './mobile/components/list-card/mob-list-card';
export { MobListLayout } from './mobile/components/layout/mob-list-layout/mob-list-layout';
export { MobFilterPanel } from './mobile/components/filter-panel/mob-filter-panel';

// Mobile List (scroll infinito reutilizable)
export { MobInfiniteScroll } from './mobile/list/mob-infinite-scroll';
export { MobileListLoader } from './mobile/list/mobile-list-loader';
