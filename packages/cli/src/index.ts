import pkg from '../package.json' with { type: 'json' };
import { createProgram } from './program.js';

await createProgram(pkg.version).parseAsync(process.argv);
