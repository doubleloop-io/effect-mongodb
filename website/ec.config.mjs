// @ts-check
import { defineEcConfig } from "@astrojs/starlight/expressive-code"

export default defineEcConfig({
  themes: ["github-dark-default", "github-light"],
  styleOverrides: {
    borderRadius: "0.5rem",
    borderColor: "var(--sl-color-hairline)",
    codeBackground: "var(--theme-code-bg)",
    frames: {
      editorTabBarBackground: "var(--theme-code-bg)",
      editorActiveTabBackground: "var(--theme-code-bg)",
      editorActiveTabIndicatorTopColor: "transparent",
      editorActiveTabIndicatorBottomColor: "var(--sl-color-white)",
      editorTabBarBorderBottomColor: "var(--sl-color-hairline)",
      terminalTitlebarBackground: "var(--theme-code-bg)",
      terminalBackground: "var(--theme-code-bg)",
      frameBoxShadowCssValue: "none"
    }
  }
})
