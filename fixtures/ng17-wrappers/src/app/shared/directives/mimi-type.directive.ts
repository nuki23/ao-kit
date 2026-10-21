import { Directive, HostBinding, Input } from '@angular/core';

export type MimiType = 'outline' | 'fill';

/** Variante visual de los controles envueltos por mimi-select / mimi-input. */
@Directive({
  selector: '[mimiType]',
  standalone: true,
})
export class MimiTypeDirective {
  @Input() mimiType: MimiType = 'outline';

  @HostBinding('class.mimi-outline')
  get isOutline(): boolean {
    return this.mimiType === 'outline';
  }

  @HostBinding('class.mimi-fill')
  get isFill(): boolean {
    return this.mimiType === 'fill';
  }
}
