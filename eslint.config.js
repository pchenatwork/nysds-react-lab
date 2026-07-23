import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "**/*.bundle.js", "src/**/*.json"],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,

      // React 19 + new JSX transform: no "import React" needed.
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // NYSDS rule 1: use NYSDS components, don't hand-roll native ones.
      "react/forbid-elements": [
        "error",
        {
          forbid: [
            {
              element: "button",
              message: "Use <NysButton>, not a native <button>.",
            },
            {
              element: "input",
              message:
                "Use <NysTextinput>/<NysCheckbox>/<NysRadiobutton>, not a native <input>.",
            },
            {
              element: "textarea",
              message: "Use <NysTextarea>, not a native <textarea>.",
            },
            {
              element: "select",
              message:
                "Use <NysSelect> (with <NysOption>), not a native <select>.",
            },
            {
              element: "dialog",
              message: "Use <NysModal>, not a native <dialog>.",
            },
          ],
        },
      ],

      // NYSDS rule 2: no hardcoded hex colors — use var(--nys-color-*) tokens.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
          message: "Hardcoded hex color. Use a --nys-* design token instead.",
        },
      ],
    },
  },
);
