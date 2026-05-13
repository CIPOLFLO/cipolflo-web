import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TagStyle } from '../../table.models';
import { TagDirective } from '../../directives/tag.directive';

@Component({
  selector: 'app-tag-cell',
  imports: [TagDirective],
  templateUrl: './tag-cell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagCellComponent {
  value = input.required<string>();
  tagMap = input.required<Record<string, TagStyle>>();

  protected label = computed(() => this.tagMap()[this.value()]?.label ?? this.value());
}
