import { Service, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Forma oficial de avisar al usuario: envuelve MatSnackBar con duración y estilos del proyecto. */
@Service()
export class Notificaciones {
  private readonly snackBar = inject(MatSnackBar);

  exito(mensaje: string): void {
    this.snackBar.open(mensaje, undefined, { duration: 3000, panelClass: 'mimi-toast--exito' });
  }

  error(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 6000, panelClass: 'mimi-toast--error' });
  }
}
