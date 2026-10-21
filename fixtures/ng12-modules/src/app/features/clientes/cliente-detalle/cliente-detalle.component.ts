import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente, ClientesService } from '@core/services/clientes.service';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cliente-detalle',
  templateUrl: './cliente-detalle.component.html',
  styleUrls: ['./cliente-detalle.component.scss'],
})
export class ClienteDetalleComponent implements OnInit {
  cliente: Cliente | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientesService: ClientesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clientesService.obtener(id).subscribe((cliente) => (this.cliente = cliente));
  }

  volver(): void {
    this.router.navigate(['/clientes']);
  }

  eliminar(cliente: Cliente): void {
    const data: ConfirmDialogData = {
      titulo: 'Eliminar cliente',
      mensaje: `¿Seguro que quieres eliminar a ${cliente.nombre}?`,
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.clientesService.eliminar(cliente.id).subscribe(() => {
            this.snackBar.open('Cliente eliminado', 'OK', { duration: 3000 });
            this.router.navigate(['/clientes']);
          });
        }
      });
  }
}
