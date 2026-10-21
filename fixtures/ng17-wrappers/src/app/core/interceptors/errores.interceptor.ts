import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SIN_AVISO_DE_ERROR } from '@core/http/contexto';
import { NotificacionesService } from '@core/services/notificaciones.service';

const mensajeDe = (error: HttpErrorResponse): string => {
  if (error.status === 0) {
    return 'No hay conexión con el servidor.';
  }
  if (error.status >= 500) {
    return 'El servidor tuvo un problema. Intenta más tarde.';
  }
  return error.error?.mensaje ?? 'No se pudo completar la operación.';
};

/** Muestra cada error HTTP con NotificacionesService, salvo que la petición pida silencio. */
export const erroresInterceptor: HttpInterceptorFn = (req, next) => {
  const notificaciones = inject(NotificacionesService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!req.context.get(SIN_AVISO_DE_ERROR)) {
        notificaciones.error(mensajeDe(error));
      }
      return throwError(() => error);
    }),
  );
};
