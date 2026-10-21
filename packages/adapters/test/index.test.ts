import { describe, expect, it } from 'vitest';
import { AGENTS } from '../src/index.js';

describe('@ao-kit/adapters', () => {
  it('lista los agentes soportados', () => {
    expect(AGENTS).toEqual(['claude', 'codex', 'agy', 'gemini']);
  });
});
