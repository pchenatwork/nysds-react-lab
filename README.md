# NYSDS React Lab

**🔗 Live demo:** https://wonderful-sand-0a0dbe20f.7.azurestaticapps.net/ (Azure Static Web Apps)

A hands-on reference app for consuming the **New York State Design System (NYSDS)** in React, developed **AI-first** with the Claude Code VS Code extension talking to the `@nysds/mcp-server` MCP server. It scaffolds a React 19 + Vite app that exercises two things a real NYS service needs: a production-grade data table, and correct accessibility across the web-component shadow boundary. The sample dataset (parks/recreation facilities) is just an example — the patterns are what matter.

- **Framework:** React 19 + Vite (TypeScript)
- **Design system:** `@nysds/components` + `@nysds/styles` (Lit 3 web components + design tokens)
- **Theme:** `environment` (green), switchable live — see [Theming](#theming)

---

## Quick start

**Prerequisites:** Node.js 20.19+ or 22.12+, npm, and (for the AI-assisted workflow) the Claude Code VS Code extension.

```bash
npm install
npm run dev        # http://localhost:3000  (opens automatically)
```

### Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server at `http://localhost:3000` (fixed port). |
| `npm run build` | `tsc -b && vite build` — type-check, then production build to `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | ESLint + Stylelint compliance gates (see below). |
| `npm run lint:fix` | Same, auto-fixing what it can. |

---

## What's in the app

Two tabs, wired up in `src/App.tsx` using the real NYSDS `nys-tabgroup`:

1. **Paginated Table Demo** — *built.* A server-paged, sortable, searchable table of facilities with a county filter and a detail modal, consuming `nys-table`, `nys-pagination`, `nys-textinput`, `nys-select`, and `nys-modal`. Lives under `src/features/facilities/`. The tricky NYSDS interop (driving the shadow-DOM sort arrow + `aria-sort` from React state, and delegating row clicks out of the cloned rows) is isolated in `src/hooks/`.
2. **Accessible Form** — *built.* A real, submittable NYS-style program-registration form built **entirely from NYSDS form-associated custom elements** (`src/features/registration/`). It demonstrates several recent NYSDS enhancements at once: form participation via ElementInternals (native `FormData` reads every field by `name` — no per-field plumbing), label + error association across the shadow boundary, `nys-combobox` type-to-filter autocomplete, and `nys-datepicker` with a min-date constraint. Verifiable end-to-end with Chrome DevTools' Accessibility pane and an axe scan.

A **live theme picker** (`src/features/theme/ThemePicker.tsx`) sits above the tabs and swaps all seven NYSDS agency themes at runtime.

---

## Exercise-specific setup

This repo is deliberately configured to make the NYSDS "paved road" automatic — an AI assistant that generates on-standard code, and lint gates that fail the build when something drifts. These two setups are what make the lab a lab.

### 1. AI assistant setup (NYSDS MCP server)

The design system ships a **Model Context Protocol** server, `@nysds/mcp-server`, that exposes every component's real API, tokens, and usage guidance to an AI assistant. Instead of guessing prop names from stale training data, Claude Code queries the server and generates NYSDS-correct code by default.

| File | Purpose |
|---|---|
| `.mcp.json` | Registers the MCP server as **`nysds`**, launched on demand via `npx -y @nysds/mcp-server` (no global install). |
| `AGENTS.md` | Vendor-neutral policy every assistant (Claude Code, Cursor, Copilot, Gemini) reads: query the MCP server first; never hand-roll a component NYSDS provides; style only through `--nys-*` tokens; meet WCAG 2.2 AA. |
| `.claude/agents/nysds-consumer.md` | A scoped **subagent** you can delegate UI work to; enforces the same paved road on every task. |
| `.claude/settings.local.json` | Enables the `nysds` server and pre-approves its read-only tools so the assistant doesn't stop to ask on every query. |

**MCP tools used** (names as approved in `settings.local.json`): `mcp__nysds__get_guide`, `mcp__nysds__validate_component_api`, `mcp__nysds__get_component`, `mcp__nysds__find_components`.

**Smoke-test the connection** — in the Claude Code panel:

```
List the tools exposed by the `nysds` MCP server, then call get_guide for
"nys-button" and show its real props, slots, and events. Use the server, not
your training data.
```

If Claude Code answers without calling the server, remind it: *"Use the `nysds` MCP server, not your training data."*

### 2. Linter & compliance-gate setup

Four layered checkpoints enforce what `AGENTS.md` states in prose. Each catches a different class of drift, and nothing on-standard is slowed down.

| Layer | Tool | File | Catches |
|---|---|---|---|
| 1 | **TypeScript** | `tsconfig.*.json` | Invalid props/variants — the app imports typed React wrappers from `@nysds/components/react`. Strongest gate; runs in `npm run build`. |
| 2 | **ESLint 9** (flat) | `eslint.config.js` | `react/forbid-elements` blocks hand-rolled native `button`/`input`/`select`/`textarea`/`dialog`; a `no-restricted-syntax` rule bans hardcoded hex colors; `jsx-a11y` static first pass. |
| 3 | **Stylelint 16** | `.stylelintrc.json` | `declaration-strict-value` forces color/spacing/typography in CSS onto `--nys-*` tokens. |
| 4 | **VS Code custom-data** | `.vscode/settings.json` | Flags unknown `--nys-*` tokens and `nys-*` attributes *as you type*, plus fix-on-save for ESLint/Stylelint. |

Run the gates:

```bash
npm run lint
```

> **ESLint is pinned to v9 on purpose.** Current Vite scaffolds install ESLint 10, but `eslint-plugin-react` and `eslint-plugin-jsx-a11y` do not support ESLint 10 yet, so their peer ranges refuse to resolve against it. This repo pins `eslint@^9`, which resolves cleanly with **no `--force` / `--legacy-peer-deps`**.

> **Accessibility caveat — don't oversell the lint.** `jsx-a11y` catches only a *subset* of static a11y issues on native HTML; it largely cannot inspect `nys-*` web components and cannot verify contrast, focus order, or keyboard operability. Full WCAG 2.2 AA verification needs **runtime** tooling (axe-core, or Playwright + `@axe-core/playwright`) in CI. Treat the lint layer as the fast first pass, not proof of AA compliance.

---

## Theming

The **full** stylesheet (`nysds-full.min.css`, linked in `index.html`) bundles all seven NYSDS agency themes, each behind a `data-theme` selector. Switching is pure CSS cascade — set the attribute on `<html>` and every component that uses the `--nys-color-theme*` tokens (brand accents) recolors.

- **Whole app:** `index.html` sets `<html lang="en" data-theme="environment">`.
- **Runtime switch:** the theme picker calls `document.documentElement.setAttribute("data-theme", value)`.
- **Available themes:** `admin`, `business`, `environment`, `health`, `local`, `safety`, `transportation`.
- **Requires the full bundle** — the slim `nysds.min.css` omits the theme blocks.

---

## Deployment

Hosted on **Azure Static Web Apps**: https://wonderful-sand-0a0dbe20f.7.azurestaticapps.net/ The build is fully static (`dist/`), so it deploys to any static host/CDN; `vite.config.ts` sets `base: "/"` because SWA serves from the root.

**Azure SWA build settings:**

| Setting | Value |
|---|---|
| App location | `/` (repo root) |
| Build command | `npm run build` |
| Output location | `dist` |
| API location | *(none — static only)* |

**SPA routing:** `staticwebapp.config.json` sets `navigationFallback.rewrite: "/index.html"` so deep links / refreshes resolve to the app shell instead of 404ing. *Tip: keep this file in `public/` so `vite build` always copies it into `dist/`.*

**To deploy a new build** (SWA CLI — scriptable, no CI required):

```bash
npm run build
npx @azure/static-web-apps-cli deploy ./dist --env production \
  --deployment-token <YOUR_SWA_DEPLOYMENT_TOKEN>
```

The deployment token comes from the Azure Portal → your Static Web App → **Manage deployment token**.

**Alternatives:**

- **VS Code** — the *Azure Static Web Apps* extension: right-click the app → **Deploy**, with build output `dist`.
- **GitHub Actions (CI)** — Azure's `Azure/static-web-apps-deploy` action on push to `main`. *Not currently committed to this repo* — the site is deployed manually today; add a workflow if you want push-to-deploy.

---

## Project structure

```
nysds-react-lab/
├─ .mcp.json                     # registers the `nysds` MCP server
├─ AGENTS.md                     # AI paved-road policy
├─ .claude/
│  ├─ agents/nysds-consumer.md   # scoped NYSDS subagent
│  └─ settings.local.json        # enables server + approves MCP tools
├─ eslint.config.js              # ESLint 9 NYSDS compliance gate
├─ .stylelintrc.json             # Stylelint token-only gate
├─ .vscode/settings.json         # editor custom-data + fix-on-save
├─ index.html                    # links nysds-full.min.css; data-theme="environment"
├─ vite.config.ts                # nysds side-effects plugin + "@" alias; dev port 3000
└─ src/
   ├─ main.tsx                   # side-effect import registers nys-* elements
   ├─ App.tsx                    # shell + nys-tabgroup (two tabs) + theme picker
   ├─ registerNysdsIcons.ts      # re-point nys-icon library for Vite
   ├─ types/common.ts            # generic paging contract (Entity/ColumnDef/PagedWeb*)
   ├─ hooks/                     # useDebounce, useNysTableSortIndicator, useNysTableRowAction
   └─ features/
      ├─ facilities/             # Tab 1 — paginated table demo (built)
      ├─ registration/           # Tab 2 — Accessible Form (form-associated controls)
      └─ theme/ThemePicker.tsx   # live theme switcher
```

---

## Key NYSDS interop notes

- **Element registration must survive tree-shaking.** `@nysds/components` declares `sideEffects: false` but registers custom elements via `customElements.define()`; `vite.config.ts` includes a plugin forcing `moduleSideEffects: true` for the NYSDS ESM bundle so nothing renders blank.
- **Styles load via `<link>`, not JS.** `@nysds/styles` is a CSS-only package; `index.html` links `nysds-full.min.css`. A bare `import "@nysds/styles"` fails (`TS2307`).
- **`verbatimModuleSyntax` is on**, so type-only imports need the `type` keyword (e.g. `import { defineConfig, type Plugin } from "vite"`).
- **`nys-table` renders a shadow-DOM clone** of your light-DOM `<table>`, which breaks React event handlers and the component's own sort state — see the hooks in `src/hooks/` for how the sort arrow, `aria-sort`, and row actions are driven from React.
- **Use NYSDS custom events** (`onNysInput`, `onNysChange`, `onNysColumnSort`, `onNysClose`), reading values off `e.target.value` or `(e as CustomEvent).detail`.

---

*Built as an NYSDS + AI-assisted-development lab. The `nysds` MCP server is the live source of truth — confirm any component prop or event there at build time.*
