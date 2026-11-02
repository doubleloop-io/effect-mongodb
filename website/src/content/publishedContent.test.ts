import { readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { expect, test } from "vitest"
import { publishedContent, publishedRepositorySite } from "./publishedContent.ts"

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

  expect(
    groups.find(({ label }) => label === "effect-mongodb")?.items.flatMap((item) => "slug" in item ? [item.slug] : [])
  ).toEqual([
    "effect-mongodb/getting-started",
    "effect-mongodb/design-decisions",
    "effect-mongodb/tracing",
    "effect-mongodb/known-limitations"
  ])
})

// Building the site fails on an example without a leading JSDoc block, so this also checks every example has one
test.each(publishedContent.readmes.filter(({ examples }) => examples !== undefined))(
  "every example of $path is published",
  ({ examples, path }) => {
    const examplesFolder = new URL(`../../../${path}/../examples/`, import.meta.url)
    const exampleFiles = readdirSync(examplesFolder).filter((file) => file.endsWith(".ts"))

    expect([...(examples ?? [])].sort()).toEqual(exampleFiles.sort())
  }
)

test("the effect-mongodb examples are nested under the package section, after Running examples", () => {
  const { sidebar } = publishedRepositorySite(repositoryRoot)

  const groups = sidebar.flatMap((item) => "items" in item ? [item] : [])

  const examples = groups.find(({ label }) => label === "effect-mongodb")?.items.find((item) =>
    "label" in item && item.label === "Examples"
  )
  expect(examples).toEqual({
    label: "Examples",
    items: [
      "running-examples",
      "aggregate",
      "project",
      "find-with-cursor-builder",
      "find-without-cursor-builder",
      "copy-between-dbs",
      "elaborate-stream-with-partitioned-errors"
    ].map((page) => ({ slug: `effect-mongodb/examples/${page}` }))
  })
})

test("the @effect-mongodb/services section lists the package README pages in README order", () => {
  const { sidebar } = publishedRepositorySite(repositoryRoot)

  const groups = sidebar.flatMap((item) => "items" in item ? [item] : [])

  expect(
    groups.find(({ label }) => label === "@effect-mongodb/services")?.items.flatMap((item) =>
      "slug" in item ? [item.slug] : []
    )
  ).toEqual(["services/getting-started"])
})

test("the services pages link the core package README to the effect-mongodb pages", () => {
  const { pages } = publishedRepositorySite(repositoryRoot)

  expect(pages.find(({ id }) => id === "services/getting-started")?.markdown).toContain(
    "(/effect-mongodb/effect-mongodb/getting-started/)"
  )
})

test("the home page links the services package to its site pages", () => {
  const { home } = publishedRepositorySite(repositoryRoot)

  expect(home?.hero.actions.map(({ link }) => link)).toContain("/effect-mongodb/services/getting-started/")
})
