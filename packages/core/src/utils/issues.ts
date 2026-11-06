import { z } from 'zod';

// Mensajes de zod en español solo en estos parseos: no se toca la configuración global de zod.
const es = z.locales.es().localeError;

/**
 * safeParse con los mensajes de zod en español y los errores como "ruta: mensaje", listos para
 * mostrar al usuario. Los mensajes propios de los refine ya están en español.
 */
export function parseWithErrors<T extends z.ZodType>(
  schema: T,
  value: unknown,
  root: string,
): { ok: true; data: z.output<T> } | { ok: false; errors: string[] } {
  const result = schema.safeParse(value, { error: es });
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    errors: result.error.issues.map((i) => `${i.path.join('.') || root}: ${i.message}`),
  };
}
