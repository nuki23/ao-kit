import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Si es true, erroresInterceptor no muestra el aviso: la pantalla maneja el error por su cuenta. */
export const SIN_AVISO_DE_ERROR = new HttpContextToken<boolean>(() => false);

export const sinAvisoDeError = (): HttpContext => new HttpContext().set(SIN_AVISO_DE_ERROR, true);
