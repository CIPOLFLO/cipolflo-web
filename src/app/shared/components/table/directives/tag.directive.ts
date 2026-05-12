import { computed, Directive, input } from '@angular/core';
import { TagStyle } from '../table.models';

@Directive({
  selector: '[appTag]',
  host: { '[class]': 'hostClasses()' },
})
export class TagDirective {
  tagMap = input.required<Record<string, TagStyle>>();
  value = input.required<string>();

  protected hostClasses = computed(() => {
    const style = this.tagMap()[this.value()];
    return style ? `app-tag ${style.styleClass}` : 'app-tag';
  });
}
