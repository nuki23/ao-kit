import { fileURLToPath } from 'node:url';

const src = (pkg: string): string =>
  fileURLToPath(new URL(`./packages/${pkg}/src/index.ts`, import.meta.url));

/** Resuelve @ao-kit/* desde src para que `pnpm test` no necesite build previo. */
export const aoKitAlias: Record<string, string> = {
  '@ao-kit/core': src('core'),
  '@ao-kit/scanner-angular': src('scanner-angular'),
  '@ao-kit/adapters': src('adapters'),
};
