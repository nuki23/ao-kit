import { Component, Input } from '@angular/core';

/** Interno de SharedModule: solo lo usa el template de app-field (no se exporta). */
@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.component.html',
  styleUrls: ['./field-error.component.scss'],
})
export class FieldErrorComponent {
  @Input() message = '';
}
