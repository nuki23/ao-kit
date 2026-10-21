import { defineProject } from 'vitest/config';
import { aoKitAlias } from '../../vitest.shared.js';

export default defineProject({
  resolve: { alias: aoKitAlias },
  test: { name: 'scanner-angular' },
});
