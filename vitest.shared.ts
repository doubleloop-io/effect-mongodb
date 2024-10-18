import * as path from "node:path"
import type { UserConfig } from "vitest/config"

const alias = (pkg: string, dir = pkg) => {
  const name = pkg === "effect-mongodb" ? "effect-mongodb" : `@doubleloop-io/${pkg}`
  const target = process.env.TEST_DIST !== undefined ? "dist/dist/esm" : "src"
  return ({
    [`${name}/test`]: path.join(__dirname, "packages", dir, "test"),
    [`${name}`]: path.join(__dirname, "packages", dir, target)
  })
}

const config: UserConfig = {
  esbuild: {
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
      ...alias("effect-mongodb")
    }
  }
}
export default config
