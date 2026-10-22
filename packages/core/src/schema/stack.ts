import { z } from 'zod';
import { PosixPath } from './common.js';

export const ProjectStructure = z.enum(['standalone', 'ngmodule', 'mixed']);

const LibraryVersion = z.strictObject({
  library: z.string().min(1),
  /** Versión instalada (lockfile) o el rango de package.json si no hay lockfile. */
  version: z.string().nullable(),
});

export const UiLibrary = z.strictObject({
  name: z.string().min(1),
  version: z.string().nullable(),
  /** Prefijos de sus elementos (`nz-`, `mat-`…). */
  prefixes: z.array(z.string().min(1)).min(1),
  /** `table`: tabla genérica del escáner; `config`: prefijos propios de `.ao/config.json`. */
  source: z.enum(['table', 'config']),
  variant: z.string().optional(),
});

export const Alias = z.strictObject({
  alias: z.string().min(1),
  /** Valores tal como están en `paths` de tsconfig. */
  paths: z.array(z.string()).min(1),
  /** Archivo o carpeta real; null si no se pudo resolver (queda un warning). */
  resolvesTo: PosixPath.nullable(),
  /** Archivo que permitió resolverlo cuando `paths` apunta a un build (p. ej. ng-package.json). */
  via: PosixPath.nullable(),
});

export const Stack = z.strictObject({
  framework: z.literal('angular'),
  angularVersion: z.string().min(1),
  angularMajor: z.int().min(2),
  workspace: z.enum(['angular-cli', 'nx', 'unknown']),
  zoneless: z.boolean(),
  /** Agregado de `projects[].projectStructure`. */
  projectStructure: ProjectStructure,
  uiLibraries: z.array(UiLibrary),
  icons: z.array(LibraryVersion),
  state: z.array(LibraryVersion),
  tests: z.array(LibraryVersion),
  styles: z.strictObject({
    preprocessors: z.array(z.enum(['css', 'scss', 'sass', 'less'])).min(1),
    /** Major de Tailwind, o null si no se usa. */
    tailwind: z.string().nullable(),
    /** Archivos de tema (variables, `@theme`, `mat.theme`). */
    themes: z.array(PosixPath),
  }),
  aliases: z.array(Alias),
});

export const Project = z.strictObject({
  name: z.string().min(1),
  type: z.enum(['application', 'library']),
  root: z.string(),
  sourceRoot: PosixPath,
  prefix: z.string().nullable(),
  builder: z.string().nullable(),
  bootstrap: z.enum(['bootstrapApplication', 'bootstrapModule']).nullable(),
  projectStructure: ProjectStructure,
  /** Solo librerías: nombre de paquete y punto de entrada (public-api). */
  packageName: z.string().nullable(),
  entryFile: PosixPath.nullable(),
  /** Paquetes del workspace que consume (por alias). */
  consumes: z.array(z.string()),
});

export const SharedScope = z.strictObject({
  scope: z.enum(['workspace', 'project']),
  project: z.string().min(1),
  source: PosixPath,
});
