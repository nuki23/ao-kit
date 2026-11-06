import { AO_DIR } from '@ao-kit/core';
import { Command } from 'commander';
import { validateAoDir } from './validate.js';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function createProgram(version: string): Command {
  const program = new Command('ao')
    .description(`Contexto de proyecto para agentes de código (escribe en ${AO_DIR}/).`)
    .version(version);

  program
    .command('validate')
    .description(
      `Valida una carpeta ${AO_DIR}/: frontmatter de las fichas, archivos que piden las plantillas y enlaces internos.`,
    )
    .argument('[dir]', `carpeta ${AO_DIR} a validar`, AO_DIR)
    .action((dir: string) => {
      const { errors, cards, files } = validateAoDir(dir);
      if (errors.length > 0) {
        console.error(`✖ ${dir}: ${plural(errors.length, 'problema', 'problemas')}`);
        for (const e of errors) console.error(`  ${e}`);
        process.exitCode = 1;
        return;
      }
      console.log(
        `✔ ${dir} válida: ${plural(files, 'archivo', 'archivos')}, ${plural(cards, 'ficha', 'fichas')}`,
      );
    });

  return program;
}
