# M0 — Hallazgos de la validación manual

Fuente: `.ao/` generado a mano (con Claude Code, sin escáner) en dos proyectos reales:
**proyecto A** (Angular 17 standalone, wrappers de ng-zorro, sin skills) y **proyecto B** (Angular 21, con CLAUDE.md y skill angular-ao).
Este documento no contiene código ni nombres de esos proyectos; los ejemplos usan `mimi-*` o nombres neutros.

## 1. Lo que funcionó y se vuelve plantilla

| Hallazgo | Dónde se vio | Decisión para ao-kit |
|---|---|---|
| **Contrato observado** del wrapper: tabla pieza → obligatoria → presencia `N/M` (atributos, directivas, bindings, label hermano) | ficha de `mimi-select` en A | Sección obligatoria en `card.md` para `kind: wrapper`. El escáner calcula la presencia de cada atributo sobre todos los usos |
| **Observado / Recomendado** separados en cada sección de conventions | A y B | Estructura fija de `conventions.md` |
| **Evidencia `archivo:línea` + conteos** en cada afirmación | A y B | Formato de evidencia común (3.1). Las líneas caducan → `/ao:sync` las recalcula por hash |
| **Distribución de uso por archivo** ("16 bloques: página1 5, página2 5…") | A | `usages` por archivo, no solo el total |
| **Código heredado sin uso** ("no tomar como referencia"): 16 de 35 componentes de `shared/` sin importar, providers importados pero no registrados | A | Detector nuevo: componentes/servicios/interceptores sin uso → `kind` marcado `unused`; nunca se usan como ejemplo en fichas ni recetas |
| **Catálogo con "No hay (todavía)"** y entradas legacy tachadas | A y B | Secciones fijas de `catalog.md`: disponibles, legacy (0 usos), no existe |
| **Contradicciones documento ↔ código** (16 en B: ruta de la skill, nombre de exports, registro de íconos, firma de BaseHttpService, rutas que cambiaron…) | B | Detector de **drift de docs**: compara CLAUDE.md/AGENTS.md/skills existentes contra el índice y lista qué documento corregir. Es la base de `/ao:sync` |
| **Excepciones con nombre** ("todas usan X salvo `features/a/b.ts:241`") | B | `exceptions[]` con evidencia en conventions y patterns |
| **Showcase excluido de los conteos** | B | Confirma `showcase` en `.ao/config.json` |
| **Patrones de dominio** no previstos: permisos por módulo (`tienePermiso` en 28 archivos), ids cifrados en la URL, estado del listado preservado entre navegaciones | B | Lista de necesidades **abierta**: además de las 10 fijas, el escáner propone "patrones emergentes" (función/servicio transversal usado en ≥ N features) y la IA los nombra |

## 2. Hallazgos que no estaban en el plan

1. **Atributos inertes.** En A, las plantillas escriben atributos con forma de directiva (`appX`, `xDirective`) que el componente standalone no importa, o cuyo selector no existe en el repo. No dan error de compilación y no hacen nada. La IA los copiaría.
   → Detector: atributo en template que coincide con el selector de una directiva del repo no importada en ese componente, o que tiene forma de directiva y no coincide con ninguna. Va a `recommendations.md` y la ficha dice "se escribe siempre, no tiene efecto".
2. **Posibles bugs** encontrados de paso: atributo duplicado en el mismo elemento, `loading.set(true)` dentro de `tap()`, `querySelectorAll` global desde un wrapper, lectura de datos del modal con el anidamiento equivocado, suscripciones sin limpieza.
   → Sección "Posibles problemas" en `recommendations.md`, separada de las migraciones. Solo los que el escáner puede detectar con evidencia (duplicados de atributo, suscripciones sin `takeUntilDestroyed`, etc.); el resto lo marca la IA como "a revisar".
3. **Dos implementaciones de lo mismo** (dos botones con código idéntico en carpetas distintas, dos funciones `formTouched`, dos utilidades de modal).
   → Ya cubierto por 4.12 (duplicados); ampliar a servicios y funciones, no solo componentes.
4. **Documentación propia del repo desactualizada** es tan común como el código inconsistente. ao-kit no debe asumir que CLAUDE.md/skills son verdad.
   → Principio: "el código manda; los docs existentes son evidencia a contrastar".

## 3. Estructura final de los archivos generados (0.4)

```
.ao/
  conventions.md   # §0 qué es el repo · §1..n por tema (Observado / Recomendado) · Heredado sin uso · Contradicciones (docs↔código, internas)
  catalog.md       # tablas por grupo (estructura, datos, filtros, carga/vacío, formularios, diálogos, íconos): Intención | Usar | Usos | Referencia real ; + "Legacy" + "No hay (todavía)"
  components/<selector>.md   # Archivo/Import/Usos(distribución) · Qué envuelve (si wrapper) · API (input, tipo, default, uso real) · Contrato observado (si wrapper) · Usos reales (2–3, con archivo:línea) · Qué hacer · Qué no hacer
  patterns/<necesidad>.md    # Forma oficial (fachada o directo) · API rápida · Ejemplos reales · Excepciones · Qué no hacer
  recipes/<tipo>.md          # Plantilla dorada (feature real) · Archivos y responsabilidades · Paso a paso · Checklist
  recommendations.md         # Migraciones (perfil vs observado) · Posibles problemas · No detectado (prioridad alta)
```

Cabecera común: `Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>`.

## 4. Tareas que salen de M0

- 0.4: congelar las plantillas de la sección 3 en `agent/templates/`, con ejemplos `mimi-*`.
- 3.1: `kind` incluye `unused`; evidencia `{ file, line, snippet? }`; `usages` por archivo; `contract[]` para wrappers (`{ piece, required, present, total }`); `docDrift[]`; `inertAttributes[]`; `possibleIssues[]`; `emergentPatterns[]`.
- 4.15: detector de código sin uso (componentes, servicios, interceptores no registrados).
- 4.16: detector de atributos inertes.
- 4.17: contrato observado de wrappers (presencia por atributo/binding/hermano).
- 4.18: patrones emergentes (servicio o función transversal usada en ≥ N features).
- 6.5: drift de docs: leer CLAUDE.md/AGENTS.md/skills del repo y listar contradicciones con el índice.
- 0.3 queda para después de la 0.1: prueba con/sin `.ao/` en casos de uso reales.
