import { registerIconLibrary } from "@nysds/components";

// Why this file exists:
// nys-icon's built-in "default" library resolves each icon to
// `new URL("./icons/<name>.svg", import.meta.url)` — relative to the bundled
// nysds.es.js module. Under Vite that module is relocated (dep pre-bundling in
// dev, hashed chunk in build), so "./icons/" points at a directory that has no
// SVGs and every fetch 404s → icons render blank.
//
// Fix: let Vite own the asset URLs. import.meta.glob imports every SVG so Vite
// serves them in dev and copies + hashes them into dist on build, then we
// re-register the "default" library to resolve names through that map.
const modules = import.meta.glob(
  "/node_modules/@nysds/components/dist/icons/*.svg",
  { query: "?url", import: "default", eager: true },
) as Record<string, string>;

const iconUrls: Record<string, string> = {};
for (const path in modules) {
  const name = path
    .split("/")
    .pop()!
    .replace(/\.svg$/, "");
  iconUrls[name] = modules[path];
}

registerIconLibrary("default", {
  resolver: (name: string) => iconUrls[name],
});

/**
 * Vite-served URL for a built-in "default" icon SVG, or undefined if unknown.
 *
 * Use this to render an icon as a plain light-DOM `<img>` when a `<nys-icon>`
 * won't survive — e.g. inside nys-table rows, which are shown via
 * `cloneNode(true)` and so drop nys-icon's shadow-DOM SVG.
 */
export const nysIconUrl = (name: string): string | undefined => iconUrls[name];
