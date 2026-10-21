import { describe, expect, it } from 'vitest';
import { AO_DIR } from '../src/index.js';

describe('@ao-kit/core', () => {
  it('expone la carpeta de salida', () => {
    expect(AO_DIR).toBe('.ao');
  });
});
