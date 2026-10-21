import { defineConfig } from 'tsup';

// Solo se publica ao-kit: los paquetes @ao-kit/* son privados y se empaquetan dentro del bin.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  noExternal: [/^@ao-kit\//],
  banner: { js: '#!/usr/bin/env node' },
  sourcemap: true,
  clean: true,
});
