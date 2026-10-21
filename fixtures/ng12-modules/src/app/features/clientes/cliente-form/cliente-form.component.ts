import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientesService, TipoCliente } from '@core/services/clientes.service';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss'],
})
export class ClienteFormComponent implements OnInit {
  id: number | null = null;
  tipos: TipoCliente[] = [];
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientesService: ClientesService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      documento: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      tipo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.clientesService.tipos().subscribe((tipos) => (this.tipos = tipos));
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.id = Number(id);
      this.clientesService.obtener(this.id).subscribe((cliente) => this.form.patchValue(cliente));
    }
  }

  errorDe(campo: string): string | null {
    const control = this.form.get(campo);
    if (!control || !control.touched || control.valid) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Este campo es obligatorio';
    }
    if (control.hasError('email')) {
      return 'Escribe un correo válido';
    }
    return 'Valor inválido';
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const cliente = { ...this.form.value, id: this.id ?? undefined };
    this.clientesService.guardar(cliente).subscribe((c) => {
      this.snackBar.open('Cliente guardado', 'OK', { duration: 3000 });
      this.router.navigate(['/clientes', c.id]);
    });
  }

  cancelar(): void {
    this.router.navigate(['/clientes']);
  }
}
