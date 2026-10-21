import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Opcion } from '@core/services/catalogos.service';
import { FilaReporte, ReportesService } from '@core/services/reportes.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, NzSelectModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss'],
})
export class ReportesComponent implements OnInit {
  periodos: Opcion[] = [
    { id: 'mes', nombre: 'Último mes' },
    { id: 'trimestre', nombre: 'Último trimestre' },
    { id: 'anio', nombre: 'Último año' },
  ];
  periodo = 'mes';
  filas: FilaReporte[] = [];
  error = false;

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.cambiarPeriodo(this.periodo);
  }

  cambiarPeriodo(periodo: string): void {
    this.periodo = periodo;
    this.error = false;
    this.reportesService.resumen(periodo).subscribe({
      next: (filas) => (this.filas = filas),
      error: () => (this.error = true),
    });
  }
}
