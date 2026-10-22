import { z } from 'zod';
import { Evidence, Hash, SymbolId } from './common.js';

export interface Route {
  path: string;
  redirectTo?: string | undefined;
  component?: string | undefined;
  loadComponent?: string | undefined;
  loadChildren?: string | undefined;
  canActivate?: string[] | undefined;
  children?: Route[] | undefined;
  showcase: boolean;
  evidence: z.infer<typeof Evidence>;
}

/** Ruta del router. Los símbolos (componentes, módulos, arrays de rutas, guards) van como SymbolId. */
export const Route: z.ZodType<Route> = z.strictObject({
  path: z.string(),
  redirectTo: z.string().optional(),
  component: SymbolId.optional(),
  loadComponent: SymbolId.optional(),
  loadChildren: SymbolId.optional(),
  canActivate: z.array(SymbolId).optional(),
  children: z.array(z.lazy(() => Route)).optional(),
  /** Ruta de showcase (`.ao/config.json`): sus usos no cuentan como reales. */
  showcase: z.boolean(),
  evidence: Evidence,
});

export const Service = z.strictObject({
  id: SymbolId,
  /** Clase, o función en interceptores y guards funcionales. */
  name: z.string().min(1),
  project: z.string().min(1),
  decorator: z.enum(['@Service', '@Injectable', 'none']),
  providedIn: z.enum(['root', 'platform', 'any', 'module', 'component', 'none']),
  baseClass: z.string().nullable(),
  role: z.enum(['data', 'facade', 'base-class', 'store', 'interceptor', 'guard', 'other']),
  /** false si nadie lo inyecta ni lo registra (4.15). */
  used: z.boolean(),
  /** Interceptores: si está registrado (`withInterceptors`, `HTTP_INTERCEPTORS`); null en el resto. */
  registered: z.boolean().nullable(),
  http: z.array(
    z.strictObject({
      method: z.enum([
        'get',
        'post',
        'put',
        'patch',
        'delete',
        'head',
        'options',
        'request',
        'httpResource',
      ]),
      url: z.string(),
      evidence: Evidence,
    }),
  ),
  hash: Hash,
  evidence: z.array(Evidence),
});

export const Token = z.strictObject({
  name: z.string().min(1),
  value: z.string(),
  kind: z.enum(['css-var', 'scss', 'less', 'tailwind-theme']),
  evidence: Evidence,
});
