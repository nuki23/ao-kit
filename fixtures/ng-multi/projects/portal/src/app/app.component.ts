import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <nav class="nav">
      <a routerLink="/inicio">Inicio</a>
      <a routerLink="/catalogo">Catálogo</a>
    </nav>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}
