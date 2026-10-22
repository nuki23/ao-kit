import { z } from 'zod';
import { Count, Evidence, split } from './common.js';

const Described = z.strictObject({ pattern: z.string().min(1), evidence: z.array(Evidence) });

/** Convenciones de un proyecto. Conteos, nunca porcentajes: los % los calcula /ao:init. */
export const Conventions = z.strictObject({
  /** `explicitFlag`: cuántos declaran `standalone:` explícito (true o false). */
  standalone: split(['standalone', 'ngmodule'], { explicitFlag: Count }),
  /** `constructorParam`: parámetro del constructor (la clave "constructor" choca con Object.prototype). */
  di: split(['constructorParam', 'inject']),
  inputs: split(['decorator', 'signal']),
  outputs: split(['decorator', 'signal']),
  controlFlow: split(['structural', 'blocks']),
  /** `eager` = `ChangeDetectionStrategy.Default` antes de v22. Cuenta el valor efectivo. */
  changeDetection: split(['onPush', 'eager']),
  services: split(['service', 'injectable']),
  providedIn: split(['root', 'module', 'component']),
  fileNaming: Described,
  featureLayout: Described.nullable(),
  wrapperUsage: z.array(
    z.strictObject({
      wrapper: z.string().min(1),
      wraps: z.string().min(1),
      followed: Count,
      total: Count,
      exceptions: z.array(Evidence),
    }),
  ),
});
