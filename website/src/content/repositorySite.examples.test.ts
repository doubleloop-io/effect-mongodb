import { expect, test } from "vitest"
import type { Repository } from "./repository.ts"
import { repositorySite } from "./repositorySite.ts"

const inMemoryRepository = (files: Record<string, string>): Repository => ({
  read: (path) => {
    const content = files[path]
    if (content === undefined) throw new Error(`No such file: ${path}`)
    return content
  },
  kind: (path) =>
    path in files ? "file" : Object.keys(files).some((file) => file.startsWith(`${path}/`)) ? "directory" : undefined
})

const libSite = (files: Record<string, string>, examples: ReadonlyArray<string> = ["find.ts"]) =>
  repositorySite(
    inMemoryRepository({
      "packages/lib/README.md": "# lib\n\n## Getting started\n\nGo.",
      "packages/lib/examples/README.md": "# lib Examples\n\n## Running examples\n\nRun them.",
      ...files
    }),
    {
      base: "/docs",
      repositoryUrl: "https://github.com/acme/repo",
      readmes: [{ path: "packages/lib/README.md", route: "lib", examples }]
    }
  )

const pageOf = (pages: ReturnType<typeof repositorySite>["pages"], id: string) => {
  const page = pages.find((candidate) => candidate.id === id)
  if (page === undefined) throw new Error(`No page ${id} among ${pages.map(({ id }) => id).join(", ")}`)
  return page
}

const example = (title: string, code = "const program = Lib.run()") =>
  [`import * as Lib from "lib"`, "", "/**", ` * ${title}`, " *", " * Highlights:", " * It runs.", " */", code, ""]
    .join("\n")

test("an example becomes a page titled by its JSDoc, introduced by its highlights, followed by its code", () => {
  const source = [
    `import * as Lib from "lib"`,
    "",
    "/**",
    " * Find",
    " *",
    " * Highlights:",
    " * Use `Lib.find` to",
    " * find things.",
    " */",
    "const program = Lib.find()",
    ""
  ].join("\n")

  const { pages } = libSite({ "packages/lib/examples/find.ts": source })

  const page = pageOf(pages, "lib/examples/find")
  expect(page.title).toBe("Find")
  expect(page.sourcePath).toBe("packages/lib/examples/find.ts")
  expect(page.markdown).toBe(
    [
      "Use `Lib.find` to\nfind things.",
      "",
      "```ts title=\"find.ts\"",
      `import * as Lib from "lib"`,
      "",
      "const program = Lib.find()",
      "```",
      "",
      "[View on GitHub](https://github.com/acme/repo/blob/main/packages/lib/examples/find.ts)",
      ""
    ].join("\n")
  )
})

test("the package sidebar group nests an Examples group: the examples README pages, then the examples in given order", () => {
  const { sidebar } = libSite(
    { "packages/lib/examples/find.ts": example("Find"), "packages/lib/examples/aggregate.ts": example("Aggregate") },
    ["find.ts", "aggregate.ts"]
  )

  expect(sidebar).toEqual([{
    label: "lib",
    items: [
      { slug: "lib/getting-started" },
      {
        label: "Examples",
        items: [
          { slug: "lib/examples/running-examples" },
          { slug: "lib/examples/find" },
          { slug: "lib/examples/aggregate" }
        ]
      }
    ]
  }])
})

test.each([
  ["the examples folder to the examples README first page", "./examples", "/docs/lib/examples/running-examples/"],
  ["an example file to its page", "./examples/find.ts", "/docs/lib/examples/find/"]
])("a relative link from the package README to %s", (_, url, route) => {
  const { pages } = libSite({
    "packages/lib/README.md": `# lib\n\n## Getting started\n\nSee [it](${url}).`,
    "packages/lib/examples/find.ts": example("Find")
  })

  expect(pageOf(pages, "lib/getting-started").markdown.trim()).toBe(`See [it](${route}).`)
})

test("a relative link from the examples README to an example points to its page", () => {
  const { pages } = libSite({
    "packages/lib/examples/README.md": "# lib Examples\n\n## Running examples\n\nTry [find](./find.ts).",
    "packages/lib/examples/find.ts": example("Find")
  })

  expect(pageOf(pages, "lib/examples/running-examples").markdown.trim()).toBe("Try [find](/docs/lib/examples/find/).")
})

test.each([
  ["has no JSDoc block", `import * as Lib from "lib"\n\nconst program = Lib.run()\n`],
  ["has its JSDoc block after the program", `const program = Lib.run()\n\n/**\n * Run\n */\nLib.main(program)\n`]
])("fails when an example %s", (_, source) => {
  expect(() => libSite({ "packages/lib/examples/find.ts": source })).toThrow(
    "packages/lib/examples/find.ts must have a leading JSDoc block"
  )
})
