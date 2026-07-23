// Note the `type` modifier on Plugin: current Vite scaffolds (Vite 7/8) enable
// `verbatimModuleSyntax` in tsconfig.node.json, which requires type-only imports
// for types. `import { defineConfig, Plugin }` (no `type`) fails with
// TS1484: "'Plugin' is a type and must be imported using a type-only import".
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Override sideEffects:false for the nysds ESM bundle so Rollup keeps the
// customElements.define() registration code. (transform hook is used because
// resolveId's moduleSideEffects isn't reliably propagated in Vite.)
function nysdsSideEffects(): Plugin {
  return {
    name: "nysds-side-effects",
    transform(_code, id) {
      if (id.includes("nysds.es")) {
        return { moduleSideEffects: true };
      }
    },
  };
}

export default defineConfig({
  plugins: [nysdsSideEffects(), react()],
  base: "/",
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 3000, strictPort: true, open: true },
});
