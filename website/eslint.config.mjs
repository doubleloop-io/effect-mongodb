import * as effectEslint from "@effect/eslint-plugin"
import js from "@eslint/js"
import eslintPluginAstro from "eslint-plugin-astro"
import { defineConfig } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig(
  { ignores: ["dist", ".astro"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  eslintPluginAstro.configs.recommended,
  {
    languageOptions: { globals: globals.node }
  },
  {
    files: ["**/*.{ts,mjs}"],
    extends: [effectEslint.configs.dprint],
    rules: {
      "@effect/dprint": [
        "error",
        {
          config: {
            indentWidth: 2,
            lineWidth: 120,
            semiColons: "asi",
            quoteStyle: "alwaysDouble",
            trailingCommas: "never",
            operatorPosition: "maintain",
            "arrowFunction.useParentheses": "force"
          }
        }
      ]
    }
  }
)
