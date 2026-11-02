import { expect, test } from "vitest"
import rootManifest from "../../../package.json"
import { repositoryLicense } from "./repositoryLicense.ts"

test("reads the license declared by the manifest", () => {
  expect(repositoryLicense({ license: "Apache-2.0" })).toBe("Apache-2.0")
})

test.each([
  ["has no license field", {}],
  ["declares a non-string license", { license: { type: "MIT" } }],
  ["declares an empty license", { license: "" }],
  ["is not an object", null]
])("fails when the manifest %s", (_, manifest) => {
  expect(() => repositoryLicense(manifest)).toThrow(/license/)
})

test("the repository manifest declares the MIT license", () => {
  expect(repositoryLicense(rootManifest)).toBe("MIT")
})
