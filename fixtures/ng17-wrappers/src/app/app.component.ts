import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <nav class="nav">
      <a routerLink="/solicitudes">Solicitudes</a>
      <a routerLink="/pagos">Pagos</a>
      <a routerLink="/perfil">Perfil</a>
      <a routerLink="/reportes">Reportes</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      .nav {
        display: flex;
        gap: 16px;
        padding: 16px 24px;
      }
    `,
  ],
})
export class AppComponent {}
