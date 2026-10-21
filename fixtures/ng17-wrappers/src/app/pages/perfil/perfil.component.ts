import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CatalogosService, Opcion } from '@core/services/catalogos.service';
import { PerfilService } from '@core/services/perfil.service';
import { MimiInputComponent } from '@shared/components/ui/mimi-input/mimi-input.component';
import { MimiSelectComponent } from '@shared/components/ui/mimi-select/mimi-select.component';
import { InputEffectDirective } from '@shared/directives/input-effect.directive';
import { MimiTypeDirective } from '@shared/directives/mimi-type.directive';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
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
    nombre: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    ciudad: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private catalogosService: CatalogosService,
  ) {}

  ngOnInit(): void {
    this.catalogosService.ciudades().subscribe((ciudades) => (this.ciudades = ciudades));
    this.perfilService.obtener().subscribe((perfil) => this.form.patchValue(perfil));
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.perfilService.actualizar(this.form.getRawValue()).subscribe(() => (this.guardado = true));
  }
}
