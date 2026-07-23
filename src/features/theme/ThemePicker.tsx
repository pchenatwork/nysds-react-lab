import { useState } from "react";
import { NysSelect, NysOption } from "@nysds/components/react";

// NYSDS ships these seven agency themes in nysds-full.min.css, each behind a
// [data-theme="…"] selector. Switching is pure CSS cascade — set the attribute
// on <html> and every component using --nys-color-theme* recolors.
const THEMES = [
  "admin", "business", "environment", "health",
  "local", "safety", "transportation",
] as const;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A live theme switcher: sets data-theme on <html>, no re-render needed. */
export default function ThemePicker() {
  const [theme, setTheme] = useState<string>(
    () => document.documentElement.getAttribute("data-theme") ?? "environment",
  );

  const handleChange = (e: Event) => {
    const value = (e.target as unknown as { value: string }).value;
    setTheme(value);
    document.documentElement.setAttribute("data-theme", value);
  };

  return (
    <NysSelect
      id="theme-picker"
      name="theme"
      label="Theme"
      width="md"
      value={theme}
      onNysChange={handleChange}
    >
      {THEMES.map((t) => (
        <NysOption key={t} value={t} label={titleCase(t)} />
      ))}
    </NysSelect>
  );
}
