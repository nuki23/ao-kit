import { describe, expect, it } from 'vitest';
import { FRAMEWORK } from '../src/index.js';

describe('@ao-kit/scanner-angular', () => {
  it('declara su framework', () => {
    expect(FRAMEWORK).toBe('angular');
  });
});
