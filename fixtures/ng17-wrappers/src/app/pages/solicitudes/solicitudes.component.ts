import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CatalogosService, Opcion } from '@core/services/catalogos.service';
import { Solicitud, SolicitudesService } from '@core/services/solicitudes.service';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { MimiInputComponent } from '@shared/components/ui/mimi-input/mimi-input.component';
import { MimiSelectComponent } from '@shared/components/ui/mimi-select/mimi-select.component';
import { InputEffectDirective } from '@shared/directives/input-effect.directive';
import { MimiTypeDirective } from '@shared/directives/mimi-type.directive';

@Component({
  selector: 'app-solicitudes',
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
    StatusBadgeComponent,
  ],
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss'],
})
export class SolicitudesComponent implements OnInit {
  tipos: Opcion[] = [];
  solicitudes: Solicitud[] = [];
  cargando = false;

  form = this.fb.nonNullable.group({
    tipo: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(200)]],
  });

  constructor(
    private fb: FormBuilder,
    private solicitudesService: SolicitudesService,
    private catalogosService: CatalogosService,
  ) {}

  ngOnInit(): void {
    this.catalogosService.tiposSolicitud().subscribe((tipos) => (this.tipos = tipos));
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.solicitudesService.listar().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.cargando = false;
      },
      error: () => (this.cargando = false),
    });
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.solicitudesService.crear(this.form.getRawValue()).subscribe(() => {
      this.form.reset();
      this.cargar();
    });
  }
}
