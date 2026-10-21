import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  BarChartOutline,
  CheckCircleOutline,
  CreditCardOutline,
  FileTextOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';
import { es_ES, provideNzI18n } from 'ng-zorro-antd/i18n';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { erroresInterceptor } from '@core/interceptors/errores.interceptor';
import { routes } from './app.routes';

/** Registro estático de íconos (ng-zorro 17: NzIconModule.forRoot); solo se empaquetan los que se listan aquí. */
const ICONOS = [BarChartOutline, CheckCircleOutline, CreditCardOutline, FileTextOutline, UserOutline];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([erroresInterceptor])),
    provideAnimations(),
    provideNzI18n(es_ES),
    importProvidersFrom(NzIconModule.forRoot(ICONOS)),
  ],
};
