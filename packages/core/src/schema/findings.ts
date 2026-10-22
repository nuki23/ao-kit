import { z } from 'zod';
import { Count, Evidence, PosixPath, SymbolId } from './common.js';

/** Atributo con forma de directiva que no tiene efecto (4.16). */
export const InertAttribute = z.strictObject({
  attribute: z.string().min(1),
  reason: z.enum([
    'directive-not-imported',
    'directive-not-visible-in-module',
    'no-matching-selector',
  ]),
  /** La directiva del repo con ese selector, si existe. */
  directive: SymbolId.nullable(),
  occurrences: Count,
  evidence: z.array(Evidence).min(1),
});

/**
 * Posibles problemas detectables sin falsos positivos (4.19). Una entrada por ocurrencia.
 * - duplicate-attribute: mismo atributo o binding dos veces en un elemento.
 * - loading-set-true-in-tap: `x.set(true)` dentro de `tap()` en el pipe de la request.
 * - subscription-without-cleanup: `subscribe` sin limpieza sobre una fuente que no completa.
 * - global-dom-query: `document.querySelector*` / `getElementsBy*` en un componente o directiva.
 */
export const PossibleIssueCode = z.enum([
  'duplicate-attribute',
  'loading-set-true-in-tap',
  'subscription-without-cleanup',
  'global-dom-query',
]);

export const PossibleIssue = z.strictObject({
  code: PossibleIssueCode,
  /** Texto para el usuario, en español. */
  message: z.string().min(1),
  evidence: Evidence,
});

/** Contradicción determinista entre la documentación del repo y el código (6.5). */
export const DocDrift = z.strictObject({
  /** Lo que dice el documento: archivo, línea y snippet. */
  doc: Evidence,
  claim: z.enum(['path', 'symbol', 'export', 'selector', 'route']),
  /** La ruta o el símbolo citado. */
  value: z.string().min(1),
  status: z.enum(['missing', 'renamed', 'moved']),
  /** Lo que muestra el código, si se encontró. */
  actual: Evidence.nullable(),
  /** Documento a corregir. */
  fix: PosixPath,
});

export const WarningCode = z.enum([
  'not-available-in-module',
  'parse-error',
  'read-error',
  'unresolved-alias',
  'unresolved-symbol',
  'detector-error',
]);

/** Problemas del análisis o del repo que no son una convención (nunca se lanza una excepción). */
export const Warning = z.strictObject({
  code: WarningCode,
  message: z.string().min(1),
  evidence: z.array(Evidence),
});
