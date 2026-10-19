import * as path from "node:path"
import type { ViteUserConfig } from "vitest/config"

const alias = (pkg: string, dir = pkg) => {
  const name = pkg === "effect-mongodb" ? "effect-mongodb" : `@effect-mongodb/${pkg}`
  const target = process.env.TEST_DIST !== undefined ? "dist/dist/esm" : "src"
  return ({
    [`${name}/test`]: path.join(import.meta.dirname, "packages", dir, "test"),
    [`${name}`]: path.join(import.meta.dirname, "packages", dir, target)
  })
}

const config: ViteUserConfig = {
  oxc: {
    target: "es2020"
  },
  test: {
    include: ["test/**/*.test.ts"],
    fakeTimers: {
      toFake: undefined
    },
    sequence: {
      concurrent: true
    },
    alias: {
      ...alias("effect-mongodb"),
      ...alias("services")
    }
  }
}
export default config
