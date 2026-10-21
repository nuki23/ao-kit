import { Component, Input } from '@angular/core';

/** Tarjeta propia del backoffice. */
@Component({
  selector: 'bo-card',
  standalone: false,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent {
  @Input() titulo?: string;
  @Input() elevada = false;
}
