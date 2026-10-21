import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Opcion } from '@core/services/catalogos.service';
import { FilaReporte, ReportesService } from '@core/services/reportes.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule],
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

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.cambiarPeriodo(this.periodo);
  }

  cambiarPeriodo(periodo: string): void {
    this.periodo = periodo;
    this.reportesService.resumen(periodo).subscribe((filas) => (this.filas = filas));
  }
}
