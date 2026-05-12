import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-amount-cell',
  imports: [CurrencyFormatPipe],
  templateUrl: './amount-cell.html',
  styleUrl: './amount-cell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmountCellComponent {
  value = input.required<number>();

  protected isPositive = computed(() => this.value() >= 0);
}
