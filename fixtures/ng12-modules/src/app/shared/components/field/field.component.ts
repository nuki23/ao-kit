import { Component, Input } from '@angular/core';

/** Envuelve un mat-form-field con el espaciado y el mensaje de error del proyecto. */
@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent {
  @Input() error: string | null = null;
}
