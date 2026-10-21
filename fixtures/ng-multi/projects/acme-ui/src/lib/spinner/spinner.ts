import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Interno de la librería: lo usa ui-button y no se exporta en public-api.ts. */
@Component({
  selector: 'ui-spinner',
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Spinner {
  readonly size = input<'sm' | 'md'>('md');
}
