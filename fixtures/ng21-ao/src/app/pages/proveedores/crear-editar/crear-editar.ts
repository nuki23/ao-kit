import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, tap } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { PageHeader } from '@shared/components/page-header/page-header';
import { ConfirmService } from '@shared/services/confirm.service';
import { ProveedoresService } from '../data-access/proveedores.service';

@Component({
  selector: 'app-proveedores-crear-editar',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    PageHeader,
  ],
  templateUrl: './crear-editar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearEditar implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ProveedoresService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);

  /** Viene del parámetro `:id` gracias a withComponentInputBinding. */
  readonly id = input<string>();

  protected readonly esEdicion = computed(() => !!this.id());
  protected readonly guardando = signal(false);
  protected readonly cargando = signal(false);
  protected readonly ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'];

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    documento: ['', Validators.required],
    ciudad: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    activo: [true],
  });

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.service
        .obtener(Number(id))
        .pipe(
          // Posible problema (loading-set-true-in-tap): tap corre cuando llega la respuesta, no al pedirla.
          tap(() => this.cargando.set(true)),
          finalize(() => this.cargando.set(false)),
        )
        .subscribe((p) => this.form.patchValue(p));
    }
  }

  protected async cancelar(): Promise<void> {
    const salir =
      !this.form.dirty ||
      (await this.confirm.confirmar({
        titulo: 'Descartar cambios',
        mensaje: 'Tienes cambios sin guardar. ¿Quieres salir de todas formas?',
        textoOk: 'Descartar',
      }));
    if (salir) {
      void this.router.navigate(['/proveedores']);
    }
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    const body = this.form.getRawValue();
    const id = this.id();
    const peticion = id ? this.service.actualizar(Number(id), body) : this.service.crear(body);
    // set(false) en tap no es un problema: apaga el indicador al llegar la respuesta.
    peticion.pipe(tap(() => this.guardando.set(false))).subscribe({
      next: (p) => void this.router.navigate(['/proveedores', p.id]),
      error: () => this.guardando.set(false),
    });
  }
}
