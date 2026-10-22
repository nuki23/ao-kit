import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CatalogosService, Opcion } from '@core/services/catalogos.service';
import { PerfilService } from '@core/services/perfil.service';
import { NotificacionesService } from '@core/services/notificaciones.service';
import { MimiInputComponent } from '@shared/components/ui/mimi-input/mimi-input.component';
import { MimiSelectComponent } from '@shared/components/ui/mimi-select/mimi-select.component';
import { InputEffectDirective } from '@shared/directives/input-effect.directive';
import { MimiTypeDirective } from '@shared/directives/mimi-type.directive';
import { noSoloEspacios } from '@shared/validators/no-solo-espacios.validator';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    MimiSelectComponent,
    MimiInputComponent,
    InputEffectDirective,
    MimiTypeDirective,
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  ciudades: Opcion[] = [];
  guardado = false;

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, noSoloEspacios()]],
    correo: ['', [Validators.required, Validators.email]],
    ciudad: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private catalogosService: CatalogosService,
    private notificaciones: NotificacionesService,
  ) {}

  ngOnInit(): void {
    this.catalogosService.ciudades().subscribe((ciudades) => (this.ciudades = ciudades));
    this.perfilService.obtener().subscribe((perfil) => this.form.patchValue(perfil));
    // Posible problema (subscription-without-cleanup): valueChanges no completa y no se limpia.
    this.form.valueChanges.subscribe(() => (this.guardado = false));
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.perfilService.actualizar(this.form.getRawValue()).subscribe(() => {
      this.guardado = true;
      this.notificaciones.exito('Perfil actualizado.');
    });
  }
}
