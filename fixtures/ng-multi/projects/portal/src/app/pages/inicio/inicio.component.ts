import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Button, Card } from '@acme/ui';
import { CatalogoService, Novedad } from '../../core/catalogo.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, Button, Card],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
  novedades: Novedad[] = [];

  constructor(
    private catalogoService: CatalogoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.catalogoService.novedades().subscribe((novedades) => (this.novedades = novedades));
  }

  irAlCatalogo(): void {
    this.router.navigate(['/catalogo']);
  }
}
