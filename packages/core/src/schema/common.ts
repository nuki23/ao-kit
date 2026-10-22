import { z } from 'zod';

/** Ruta relativa a la raíz del repo escaneado, con "/", sin "./", sin ".." y sin unidad ni "/" inicial. */
export const PosixPath = z
  .string()
  .min(1)
  .refine(
    (p) =>
      !p.includes('\\') &&
      !p.startsWith('/') &&
      !p.startsWith('./') &&
      !/^[A-Za-z]:/.test(p) &&
      !p.split('/').includes('..'),
    { message: 'debe ser una ruta POSIX relativa a la raíz del repo' },
  );

/**
 * Identificador de un símbolo: "<PosixPath>#<Nombre>" (clase, función o constante).
 * Permite varios componentes, directivas, pipes o servicios por archivo.
 */
export const SymbolId = z
  .string()
  .regex(/^[^#\s\\]+#[A-Za-z_$][\w$]*$/, { message: 'debe ser "<ruta>#<Nombre>"' })
  .refine((id) => PosixPath.safeParse(id.slice(0, id.indexOf('#'))).success, {
    message: 'la parte de ruta debe ser POSIX relativa a la raíz del repo',
  });

/** Evidencia común de toda afirmación del índice. `snippet` solo donde aporta (usos, ejemplos). */
export const Evidence = z.strictObject({
  file: PosixPath,
  line: z.int().min(1),
  snippet: z.string().optional(),
});

/** Evidencia con una explicación corta (excepciones de una convención o un patrón). */
export const Exception = z.strictObject({
  ...Evidence.shape,
  detail: z.string().optional(),
});

/** Proporción guardada como conteos, nunca como porcentaje. */
export const Ratio = z
  .strictObject({ value: z.int().min(0), total: z.int().min(0) })
  .refine((r) => r.value <= r.total, { message: 'value no puede superar total' });

/** Hash de contenido (el algoritmo lo fija 3.3). */
export const Hash = z.string().regex(/^[0-9a-f]{8,128}$/, { message: 'hash hexadecimal' });

export const Count = z.int().min(0);

/** Minoría ≥ 30 % del total: la convención está dividida y /ao:init pregunta (6.4). */
export const DIVIDED_MINORITY = 0.3;

/**
 * Convención con dos o más formas: conteos por forma, la mayoría (null si empatan o no hay datos),
 * si está dividida y la evidencia de cada forma.
 */
export function split<
  const K extends readonly [string, ...string[]],
  E extends z.ZodRawShape = Record<never, never>,
>(keys: K, extra: E = {} as E) {
  const key = z.enum(keys);
  const counts = z.strictObject(
    Object.fromEntries(keys.map((k) => [k, Count])) as Record<K[number], typeof Count>,
  );
  const evidence = z.strictObject(
    Object.fromEntries(keys.map((k) => [k, z.array(Evidence)])) as Record<
      K[number],
      z.ZodArray<typeof Evidence>
    >,
  );
  return z
    .strictObject({ counts, majority: key.nullable(), divided: z.boolean(), evidence, ...extra })
    .superRefine((value, ctx) => {
      const s = value as unknown as {
        counts: Record<string, number>;
        majority: string | null;
        divided: boolean;
      };
      const values = Object.values(s.counts);
      const total = values.reduce((a, b) => a + b, 0);
      const max = Math.max(...values);
      const leaders = keys.filter((k) => s.counts[k] === max);
      const majority = total === 0 || leaders.length > 1 ? null : leaders[0];
      if (s.majority !== majority) {
        ctx.addIssue({
          code: 'custom',
          path: ['majority'],
          message: `la mayoría según los conteos es ${String(majority)}`,
        });
      }
      const minority = total - max;
      const divided = total > 0 && (leaders.length > 1 || minority / total >= DIVIDED_MINORITY);
      if (s.divided !== divided) {
        ctx.addIssue({
          code: 'custom',
          path: ['divided'],
          message: `divided debe ser ${String(divided)} con esos conteos`,
        });
      }
    });
}
