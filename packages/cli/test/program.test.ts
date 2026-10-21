import { describe, expect, it } from 'vitest';
import { createProgram } from '../src/program.js';

describe('ao-kit cli', () => {
  it('se llama ao y reporta la versión', () => {
    const program = createProgram('1.2.3');
    expect(program.name()).toBe('ao');
    expect(program.version()).toBe('1.2.3');
  });
});
