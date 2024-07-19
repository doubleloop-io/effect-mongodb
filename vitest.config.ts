import * as path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["test/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    reporters: ["hanging-process", "default"],
    sequence: {
      concurrent: true
    },
    alias: {
      "@doubleloop-io/effect-mongodb": path.join(__dirname, "src"),
      "@doubleloop-io/effect-mongodb/test": path.join(__dirname, "test")
    },
    globalSetup: ["./test/globalSetup/mongodb.ts"]
  }
})
