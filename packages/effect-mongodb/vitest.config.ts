import { mergeConfig, type ViteUserConfigExport } from "vitest/config"
import shared from "../../vitest.shared.js"

const config: ViteUserConfigExport = {
  test: {
    globalSetup: ["./test/globalSetup/mongodb.ts"]
  }
}

export default mergeConfig(shared, config)
