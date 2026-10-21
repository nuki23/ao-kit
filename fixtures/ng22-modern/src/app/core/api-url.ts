import { InjectionToken } from '@angular/core';

/** Origen de la URL de la API; se provee en app.config.ts. */
export const API_URL = new InjectionToken<string>('API_URL');
