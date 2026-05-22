import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-price-cell',
  imports: [CurrencyFormatPipe],
  templateUrl: './price-cell.html',
  styleUrl: './price-cell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceCellComponent {
  value = input.required<number>();
  unit = input.required<string>();
  colorVariant = input<'green'>();
}
