import { fileURLToPath } from "node:url"
import { expect, test } from "vitest"
import { publishedRepositorySite } from "./publishedContent.ts"

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url))

test("every relative link of the published repository files resolves", () => {
  expect(() => publishedRepositorySite(repositoryRoot)).not.toThrow()
})

test("the sidebar starts with Overview and Compatibility and ends with Contributing", () => {
  const { sidebar } = publishedRepositorySite(repositoryRoot)

  expect(sidebar.slice(0, 2)).toEqual([{ label: "Overview", slug: "index" }, { slug: "compatibility" }])
  expect(sidebar.at(-1)).toEqual({ slug: "contributing" })
})

test("the Compatibility page groups the Effect and MongoDB driver compatibility", () => {
  const { pages } = publishedRepositorySite(repositoryRoot)

  const compatibility = pages.find(({ id }) => id === "compatibility")

  expect(compatibility?.markdown).toMatch(/^## Effect$/m)
  expect(compatibility?.markdown).toMatch(/^## MongoDB driver$/m)
})

test("the Contributing page explains how to report bugs and request features", () => {
  const { pages } = publishedRepositorySite(repositoryRoot)

  const contributing = pages.find(({ id }) => id === "contributing")

  expect(contributing?.markdown).toMatch(/^## Found a Bug\?$/m)
  expect(contributing?.markdown).toMatch(/^## Missing a Feature\?$/m)
})

test("the effect-mongodb section lists the package README pages in README order", () => {
  const { sidebar } = publishedRepositorySite(repositoryRoot)

  const groups = sidebar.flatMap((item) => "items" in item ? [item] : [])

  expect(groups.find(({ label }) => label === "effect-mongodb")?.items.map(({ slug }) => slug)).toEqual([
    "effect-mongodb/getting-started",
    "effect-mongodb/design-decisions",
    "effect-mongodb/tracing",
    "effect-mongodb/known-limitations"
  ])
})
