/** Agentes para los que habrá adaptador (ver M7 y M8 en TASKS.md). */
export const AGENTS = ['claude', 'codex', 'agy', 'gemini'] as const;

export type Agent = (typeof AGENTS)[number];
