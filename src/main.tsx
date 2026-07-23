import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Side-effect import: registers all nys-* custom elements on the page.
// No @lit/react wrappers needed — React 19 handles custom elements natively.
import "@nysds/components/react";

// Global NYSDS styles + design tokens.
// import "@nysds/styles";

// NOTE: do NOT `import "@nysds/styles"` here. @nysds/styles is a CSS-only
// package — its entry point is dist/nysds.min.css, not JavaScript — so a bare
// JS import fails with TS2307 ("Cannot find module ... or its type
// declarations"). Global styles/tokens are loaded via a <link> in index.html
// (see step (b)).

import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
