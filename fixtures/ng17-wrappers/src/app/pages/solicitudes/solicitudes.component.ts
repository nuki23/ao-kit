import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CatalogosService, Opcion } from '@core/services/catalogos.service';
import { NotificacionesService } from '@core/services/notificaciones.service';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { MimiInputComponent } from '@shared/components/ui/mimi-input/mimi-input.component';
import { MimiSelectComponent } from '@shared/components/ui/mimi-select/mimi-select.component';
import { InputEffectDirective } from '@shared/directives/input-effect.directive';
import { MimiTypeDirective } from '@shared/directives/mimi-type.directive';
import { noSoloEspacios } from '@shared/validators/no-solo-espacios.validator';
import { SolicitudesStore } from './solicitudes.store';

@Component({
  selector: 'app-solicitudes',
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
    StatusBadgeComponent,
  ],
  providers: [SolicitudesStore],
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss'],
})
export class SolicitudesComponent implements OnInit {
  // signalStore no tiene un tipo de clase para el constructor: se obtiene con inject().
  readonly store = inject(SolicitudesStore);

  tipos: Opcion[] = [];

  form = this.fb.nonNullable.group({
    tipo: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(200), noSoloEspacios()]],
  });

  constructor(
    private fb: FormBuilder,
    private catalogosService: CatalogosService,
    private notificaciones: NotificacionesService,
  ) {
    // Con limpieza: takeUntilDestroyed en el contexto de inyección del constructor.
    this.form.controls.tipo.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.descripcion.markAsUntouched());
  }

  ngOnInit(): void {
    this.catalogosService.tiposSolicitud().subscribe((tipos) => (this.tipos = tipos));
    this.store.cargar();
  }

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.crear(this.form.getRawValue()).subscribe(() => {
      this.form.reset();
      this.notificaciones.exito('Solicitud enviada.');
    });
  }
}
