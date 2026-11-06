# ao-kit

Contexto de proyecto para agentes de código. ao-kit lee un repo Angular y escribe en `.ao/` **cómo se trabaja en ese repo**: convenciones observadas (con archivos y conteos), un catálogo de "para esta intención, usa este componente", una ficha por componente compartido (con el contrato real de sus wrappers), patrones (modales, API, formularios…), recetas sobre features reales y recomendaciones. Con eso, el agente reutiliza lo que ya existe en vez de reinventarlo.

> Estado: versión temprana, solo con prompts (`/ao:init` analiza el repo él mismo). El escáner determinista (`ao scan`) llega después y `/ao:init` lo usará cuando exista.

## Instalación en Claude Code (3 pasos)

En Claude Code, dentro del repo donde lo vas a usar:

```text
/plugin marketplace add nuki23/ao-kit
/plugin install ao@ao-kit
/ao:init
```

1. `marketplace add` registra este repo como marketplace (`ao-kit`).
2. `install` instala el plugin `ao`, que trae `/ao:init` y `/ao:view` con sus plantillas.
3. `/ao:init` analiza el repo y escribe `.ao/`, agrega la sección "Contexto del proyecto (ao-kit)" en `AGENTS.md` y el import `@AGENTS.md` en `CLAUDE.md` (sin borrar nada). No toca el código. Si una convención está dividida en el repo, te pregunta cuál seguir en código nuevo.

Revisa lo generado y haz commit de `.ao/`, `AGENTS.md` y `CLAUDE.md` para que todo el equipo (y sus agentes) lo use.

Desde la terminal también funciona: `claude plugin marketplace add nuki23/ao-kit` y `claude plugin install ao@ao-kit`.

## Uso de /ao:view

```text
/ao:view listado de categorías con filtros y paginación
/ao:view https://www.figma.com/design/<archivo>/<nombre>?node-id=1-2
```

1. Lee `.ao/` (si no existe, te pide correr `/ao:init`).
2. Te muestra el **plan de reutilización**: qué componentes, patrones y receta va a usar (con la ruta de cada ficha) y qué es nuevo, con su justificación. Si todo existe, sigue sin preguntar; si hay algo nuevo, te pregunta una vez.
3. Genera la vista siguiendo la receta, los contratos de los wrappers y las convenciones del repo.
4. Se autorrevisa (sin duplicados, sin atributos inertes, sin código legacy como ejemplo) y te da un reporte breve. Si crea un componente compartido, agrega su ficha y su fila en el catálogo.

Con un link de Figma usa el MCP de Figma si lo tienes configurado; si no, te pide una captura.

## Uso manual en Codex y Antigravity

Los dos leen skills (`SKILL.md`) desde `.agents/skills/` en el repo. Cada comando de ao-kit es una carpeta autosuficiente en [`plugins/ao/skills/`](plugins/ao/skills/) (el `SKILL.md` y sus plantillas en `templates/`). Cópialas con un nombre que no choque con otras skills:

```bash
# desde la raíz de tu repo, con ao-kit clonado en ../ao-kit
mkdir -p .agents/skills
cp -r ../ao-kit/plugins/ao/skills/init .agents/skills/ao-init
cp -r ../ao-kit/plugins/ao/skills/view .agents/skills/ao-view
sed -i 's/^name: init$/name: ao-init/' .agents/skills/ao-init/SKILL.md
sed -i 's/^name: view$/name: ao-view/' .agents/skills/ao-view/SKILL.md
```

| Agente | Dónde (en el repo) | Dónde (para todos tus repos) | Cómo se llama |
|---|---|---|---|
| Codex (CLI e IDE) | `.agents/skills/ao-init/`, `.agents/skills/ao-view/` | `~/.agents/skills/` | `$ao-init`, `$ao-view listado de…` (o `/skills`) |
| Antigravity | `.agents/skills/ao-init/`, `.agents/skills/ao-view/` (acepta también el antiguo `.agent/skills/`) | `~/.gemini/config/skills/` | pídelo por su nombre: "usa ao-init", "usa ao-view para un listado de…" |

Notas:
- `${CLAUDE_SKILL_DIR}` y `$ARGUMENTS` son de Claude Code; en otros agentes el prompt ya indica que las plantillas están en `templates/` junto al `SKILL.md` y que la petición es tu mensaje.
- Si copias las skills al repo, `/ao:init` las reconoce como propias y no las contrasta como documentación del equipo.
- Fuentes de las rutas: [skills de Codex](https://learn.chatgpt.com/docs/build-skills), [skills de Antigravity](https://antigravity.google/docs/skills).

## Para desarrollar ao-kit

```bash
pnpm i
pnpm build      # compila los paquetes y regenera el plugin (plugins/ao) desde agent/
pnpm test
pnpm ao validate <ruta>/.ao   # valida una carpeta .ao generada
```

Los prompts se escriben una sola vez en `agent/commands/` y las plantillas en `agent/templates/`; `plugins/ao/` y `.claude-plugin/marketplace.json` son generados y nunca se editan a mano. Detalles en [CLAUDE.md](CLAUDE.md), [docs/plan.md](docs/plan.md) y [TASKS.md](TASKS.md).

Licencia: propietaria, todos los derechos reservados (pendiente de definir el licenciamiento).
