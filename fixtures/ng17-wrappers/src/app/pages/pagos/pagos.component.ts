import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { CatalogosService, Opcion } from '@core/services/catalogos.service';
import { Pago, PagosService } from '@core/services/pagos.service';
import { NotificacionesService } from '@core/services/notificaciones.service';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';
import { MimiInputComponent } from '@shared/components/ui/mimi-input/mimi-input.component';
import { MimiSelectComponent } from '@shared/components/ui/mimi-select/mimi-select.component';
import { InputEffectDirective } from '@shared/directives/input-effect.directive';
import { MimiTypeDirective } from '@shared/directives/mimi-type.directive';

@Component({
  selector: 'app-pagos',
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
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss'],
})
export class PagosComponent implements OnInit {
  bancos: Opcion[] = [];
  recientes: Pago[] = [];

  form = this.fb.nonNullable.group({
    banco: ['', Validators.required],
    monto: [0, [Validators.required, Validators.min(1)]],
    referencia: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private pagosService: PagosService,
    private catalogosService: CatalogosService,
    private notificaciones: NotificacionesService,
  ) {}

  ngOnInit(): void {
    this.catalogosService.bancos().subscribe((bancos) => (this.bancos = bancos));
    this.pagosService.recientes().subscribe((pagos) => (this.recientes = pagos));
  }

  pagar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.pagosService.registrar(this.form.getRawValue()).subscribe((pago) => {
      this.recientes = [pago, ...this.recientes];
      this.form.reset();
      this.notificaciones.exito('Pago registrado.');
    });
  }
}
