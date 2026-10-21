import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

export interface FilaReporte {
  concepto: string;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly baseUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  resumen(periodo: string): Observable<FilaReporte[]> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.get<FilaReporte[]>(`${this.baseUrl}/resumen`, { params });
  }
}
