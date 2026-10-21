import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Opcion {
  id: string;
  etiqueta: string;
}

/** Grupo de botones excluyentes (tipo "segmented control"). No es un botón. */
@Component({
  selector: 'bo-button-group',
  standalone: false,
  templateUrl: './button-group.component.html',
  styleUrls: ['./button-group.component.css'],
})
export class ButtonGroupComponent {
  @Input() opciones: Opcion[] = [];
  @Input() seleccion: string | null = null;
  @Output() seleccionChange = new EventEmitter<string>();

  elegir(id: string): void {
    this.seleccion = id;
    this.seleccionChange.emit(id);
  }
}
