import { Component, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideListTodo } from '@lucide/angular';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, LucideListTodo],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: { '(window:offline)': 'avisarSinConexion()' },
})
export class App {
  // Excepción: aviso global con MatSnackBar directo, sin pasar por Notificaciones.
  private readonly snackBar = inject(MatSnackBar);

  protected avisarSinConexion(): void {
    this.snackBar.open('Sin conexión. Los cambios se guardarán al reconectar.', 'Entendido');
  }
}
