import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '@core/api-url';
import { Tarea, TareaPayload } from './tarea.model';

/** Escrituras de tareas. Las lecturas se hacen con httpResource en cada pantalla. */
@Service()
export class TareasApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(API_URL)}/tareas`;

  crear(body: TareaPayload): Observable<Tarea> {
    return this.http.post<Tarea>(this.baseUrl, body);
  }

  actualizar(id: number, body: TareaPayload): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.baseUrl}/${id}`, body);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
