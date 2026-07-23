# AGENTS.md

Policy for any AI coding assistant (Claude Code, Cursor, Copilot, Gemini, etc.) working in this repo.

## Component source of truth

- Query the **`@nysds/mcp-server`** MCP server (registered as `nysds` in `.mcp.json`) for every component's real API, props, slots, and usage before writing code. Treat its output as authoritative over training data.
- **Never hand-roll a component that already exists in NYSDS.** Buttons, inputs, alerts, cards, etc. come from `@nysds/components` — import them, don't reinvent them.
- If a needed component seems missing, confirm via the MCP server first; only then compose from existing primitives.

## Styling

- Style **only** through `--nys-*` design tokens (from `@nysds/styles`). No hardcoded hex colors, px spacing, or font values.
- Do not override NYSDS component internals with ad-hoc CSS; use the documented token/prop hooks.

## Accessibility

- Every change must meet **WCAG 2.2 AA**. Verify color contrast, keyboard operability, focus visibility, and accessible names before finishing.

## Stack notes

- React 19; NYSDS components are Lit web components consumed from React. Follow the MCP server's React-interop guidance for events and refs.
