import { Component, EventEmitter, Input, Output } from '@angular/core';

/** Contenedor con título y zona de acciones (`[cardActions]`); el contenido varía en cada uso. */
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input() titulo?: string;
  @Input() subtitulo?: string;
  @Input() cerrable = false;
  @Output() cerrar = new EventEmitter<void>();
}
