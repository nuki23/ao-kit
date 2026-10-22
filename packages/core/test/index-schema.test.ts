import { describe, expect, it } from 'vitest';
import { ExpectedFixture, Index, SCHEMA_VERSION } from '../src/index.js';
import { sampleIndex } from './sample-index.js';

// Los casos inválidos rompen el índice a propósito: se manipula como JSON sin tipos.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = Record<string, any>;
const clone = (): Loose => structuredClone(sampleIndex) as Loose;

const issues = (value: unknown) => {
  const result = Index.safeParse(value);
  return result.success ? [] : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

/** Reordena las claves de todos los objetos, en profundidad. */
const reverseKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(reverseKeys);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .reverse()
        .map(([k, v]) => [k, reverseKeys(v)]),
    );
  }
  return value;
};

describe('esquema de index.json', () => {
  it('un índice completo de ejemplo pasa la validación', () => {
    expect(issues(sampleIndex)).toEqual([]);
  });

  it('serializa igual sin importar el orden de las claves de entrada', () => {
    const a = JSON.stringify(Index.parse(sampleIndex));
    const b = JSON.stringify(Index.parse(reverseKeys(sampleIndex)));
    expect(b).toBe(a);
  });

  it('acepta solo la versión actual del esquema', () => {
    expect(SCHEMA_VERSION).toBe(1);
    expect(issues({ ...clone(), schemaVersion: 2 })).not.toEqual([]);
  });

  it('rechaza campos desconocidos (objetos estrictos)', () => {
    const index = clone();
    index['components'][0].percent = 100;
    expect(issues(index)).not.toEqual([]);
    expect(issues({ ...clone(), generatedAt: '2026-10-21' })).not.toEqual([]);
  });

  it('exige rutas POSIX relativas a la raíz', () => {
    for (const file of [
      'C:/repo/src/a.ts',
      '/src/a.ts',
      './src/a.ts',
      'src\\a.ts',
      '../otro/a.ts',
    ]) {
      const index = clone();
      index['components'][0].files.ts = file;
      expect(issues(index), file).not.toEqual([]);
    }
  });

  it('los id son "<ruta>#<Nombre>" y no se repiten', () => {
    const sinNombre = clone();
    sinNombre['components'][0].id = 'src/app/shared/mimi-select/mimi-select.component.ts';
    expect(issues(sinNombre)).not.toEqual([]);

    const repetido = clone();
    repetido['components'][1].id = repetido['components'][0].id;
    expect(issues(repetido)).toContainEqual(expect.stringContaining('id repetido'));
  });

  it('referencias a proyectos inexistentes fallan', () => {
    const index = clone();
    index['conventions'] = { otro: index['conventions'].mimi };
    expect(issues(index)).toContainEqual(expect.stringContaining('proyecto desconocido: otro'));
  });

  describe('kind', () => {
    it('unused exige formerKind y unusedReason, y al revés', () => {
      const sinReason = clone();
      delete sinReason['components'][1].unusedReason;
      expect(issues(sinReason)).not.toEqual([]);

      const conFormerKind = clone();
      conFormerKind['components'][0].formerKind = 'wrapper';
      expect(issues(conFormerKind)).not.toEqual([]);
    });

    it('acepta exported-not-consumed para exports de librería sin consumidores', () => {
      const index = clone();
      index['components'][1].unusedReason = 'exported-not-consumed';
      index['components'][1].exported = true;
      expect(issues(index)).toEqual([]);
    });

    it('wraps y contract son solo de wrappers', () => {
      const wraps = clone();
      wraps['components'][1].wraps = 'nz-table';
      expect(issues(wraps)).not.toEqual([]);

      const contract = clone();
      contract['components'][1].contract = [];
      expect(issues(contract)).not.toEqual([]);
    });

    it('en el contrato, required equivale a present === total', () => {
      const index = clone();
      index['components'][0].contract[1].required = true;
      expect(issues(index)).not.toEqual([]);
    });
  });

  describe('convenciones', () => {
    it('la mayoría debe salir de los conteos', () => {
      const index = clone();
      index['conventions'].mimi.inputs.majority = 'signal';
      expect(issues(index)).not.toEqual([]);
    });

    it('divided es true cuando la minoría es ≥ 30 % (6.4)', () => {
      const index = clone();
      index['conventions'].mimi.di.divided = false;
      expect(issues(index)).not.toEqual([]);
    });

    it('con conteos en cero no hay mayoría', () => {
      const index = clone();
      index['conventions'].mimi.outputs.majority = 'signal';
      expect(issues(index)).not.toEqual([]);
    });
  });

  it('patterns solo admite las 10 necesidades y details tipado en las de prioridad alta', () => {
    const otra = clone();
    otra['patterns'].permisos = otra['patterns'].estado;
    expect(issues(otra)).not.toEqual([]);

    const factsEnAlta = clone();
    factsEnAlta['patterns'].modales.details = { facts: [] };
    expect(issues(factsEnAlta)).not.toEqual([]);
  });

  it('possibleIssues solo admite los códigos de 4.19', () => {
    const index = clone();
    index['possibleIssues'][0].code = 'magic-number';
    expect(issues(index)).not.toEqual([]);
  });
});

describe('formato de expected.json', () => {
  it('admite un índice parcial con $comment pero mantiene los tipos de las hojas', () => {
    const ok = {
      $comment: 'x',
      schemaVersion: 1,
      index: { components: [{ $comment: 'y', kind: 'wrapper' }] },
    };
    expect(ExpectedFixture.safeParse(ok).success).toBe(true);

    const malKind = {
      $comment: 'x',
      schemaVersion: 1,
      index: { components: [{ kind: 'envoltorio' }] },
    };
    expect(ExpectedFixture.safeParse(malKind).success).toBe(false);

    const malId = {
      $comment: 'x',
      schemaVersion: 1,
      index: { components: [{ id: 'sin-almohadilla.ts' }] },
    };
    expect(ExpectedFixture.safeParse(malId).success).toBe(false);
  });
});
