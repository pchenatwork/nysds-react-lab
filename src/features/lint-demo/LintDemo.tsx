// ⚠️ TEMP DEMO FILE — delete after the interview demo.
// Purpose: show the NYSDS ESLint compliance gate catching drift.
// Inline: hover the red squiggles in VS Code. CLI: npx eslint src/features/lint-demo/LintDemo.tsx
//
// Expected errors:
//   <input>       → "Use <NysTextinput>/<NysCheckbox>/<NysRadiobutton>, not a native <input>."
//   <button>      → "Use <NysButton>, not a native <button>."
//   "#ff6600"     → "Hardcoded hex color. Use a --nys-* design token instead."
//
// Compliant version: import { NysTextinput, NysButton } from "@nysds/components/react"
// and color via a --nys-* token instead of a hex literal.
export default function LintDemo() {
  //const brandColor = "#ff6600"; // caught even via a variable — the LITERAL is flagged
  const brandColor = "var(--nys-color-admin-orange-500)"; // compliant — use a design token instead of a hex literal
  return (
    <div style={{ color: brandColor }}>
      <input placeholder="Search" />
      <button>Go</button>
    </div>
  );
}
