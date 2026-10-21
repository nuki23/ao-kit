# agent/templates

Plantillas de los archivos que `/ao:init` (y después `/ao:sync`) escribe en `.ao/` del repo destino. Salen de la validación manual de M0 (`docs/m0-hallazgos.md`, sección 3).

| Plantilla | Archivo generado |
|---|---|
| `conventions.md` | `.ao/conventions.md` |
| `catalog.md` | `.ao/catalog.md` |
| `card.md` | `.ao/components/<selector>.md` (una por componente compartido) |
| `pattern.md` | `.ao/patterns/<necesidad>.md` (solo necesidades con evidencia) |
| `recipe.md` | `.ao/recipes/<tipo>.md` (`listado`, `crear-editar`, `detalle`, `modal`) |
| `recommendations.md` | `.ao/recommendations.md` |

## Cómo leerlas

- `<entre ángulos>`: lo reemplaza el agente con datos del índice o del código.
- `<!-- ao: … -->`: instrucción para el agente; no se copia al archivo generado.
- Los ejemplos usan `mimi-*` y nombres neutros. Nunca van nombres reales de clientes ni proyectos.
- Una sección sin datos se omite entera, salvo que la plantilla diga que va siempre (por ejemplo "No hay (todavía)" o "No detectado").

## Reglas comunes

1. **Cabecera común**, primera línea después del título:
   `Generado el <fecha> sobre <rama> · ao-kit <versión> · conteos excluyen: <showcase, deprecated>`
   La fecha y la rama las pone el agente; el índice no guarda fechas (es determinista).
2. **Toda afirmación lleva evidencia**: `archivo:línea` relativos a la raíz y conteos (`14 archivos: pages/solicitudes/…`). Sin evidencia, no se escribe.
3. **Observado gana sobre recomendado.** Lo que hace el repo va en "Observado"; lo del perfil (`profiles/angular-modern`) solo en "Recomendado" o en `recommendations.md`.
4. **Código sin uso, legacy y showcase nunca son ejemplo.** Lo `unused` y lo de `deprecated` solo aparece en "Heredado sin uso" / "Legacy"; el showcase no cuenta en los conteos.
5. **El código manda sobre los docs del repo.** Si CLAUDE.md, AGENTS.md o una skill dicen otra cosa que el código, se anota en "Contradicciones"; no se copia.
6. **Excepciones con nombre**: "todas usan X salvo `features/a/b.ts:241`", nunca "casi todas".
