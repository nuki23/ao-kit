import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Card } from '@acme/ui';
import { CatalogoService, Articulo } from '../../core/catalogo.service';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, Card, ButtonComponent],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css'],
})
export class CatalogoComponent implements OnInit {
  articulos: Articulo[] = [];
  agregando: number | null = null;
  cargandoMas = false;

  constructor(private catalogoService: CatalogoService) {}

  ngOnInit(): void {
    this.catalogoService.articulos().subscribe((articulos) => (this.articulos = articulos));
  }

  agregar(articulo: Articulo): void {
    this.agregando = articulo.id;
    this.catalogoService.agregarAlCarrito(articulo.id).subscribe(() => (this.agregando = null));
  }

  cargarMas(): void {
    this.cargandoMas = true;
    this.catalogoService.articulos().subscribe((mas) => {
      this.articulos = [...this.articulos, ...mas];
      this.cargandoMas = false;
    });
  }
}
