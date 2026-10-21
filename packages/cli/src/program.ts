import { AO_DIR } from '@ao-kit/core';
import { Command } from 'commander';

export function createProgram(version: string): Command {
  return new Command('ao')
    .description(`Contexto de proyecto para agentes de código (escribe en ${AO_DIR}/).`)
    .version(version);
}
