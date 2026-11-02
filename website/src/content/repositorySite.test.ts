import { expect, test } from "vitest"
import type { Repository } from "./repository.ts"
import { repositorySite } from "./repositorySite.ts"

const site = { base: "/docs", repositoryUrl: "https://github.com/acme/repo" }

const inMemoryRepository = (files: Record<string, string>): Repository => ({
  read: (path) => {
    const content = files[path]
    if (content === undefined) throw new Error(`No such file: ${path}`)
    return content
  },
  kind: (path) =>
    path in files ? "file" : Object.keys(files).some((file) => file.startsWith(`${path}/`)) ? "directory" : undefined
})

const libReadme = (sections: string) => `# lib\n\nA library.\n\n${sections}`

const pageOf = (pages: ReturnType<typeof repositorySite>["pages"], id: string) => {
  const page = pages.find((candidate) => candidate.id === id)
  if (page === undefined) throw new Error(`No page ${id} among ${pages.map(({ id }) => id).join(", ")}`)
  return page
}

const libSite = (files: Record<string, string>) =>
  repositorySite(inMemoryRepository(files), {
    ...site,
    readmes: [{ path: "packages/lib/README.md", route: "lib" }]
  })

test("every ## section of a published README becomes a page, in README order", () => {
  const readme = libReadme("## Getting started\n\nInstall it.\n\n## Known limitations\n\nNone.")

  const { pages } = libSite({ "packages/lib/README.md": readme })

  expect(pages.map(({ id, title }) => ({ id, title }))).toEqual([
    { id: "lib/getting-started", title: "Getting started" },
    { id: "lib/known-limitations", title: "Known limitations" }
  ])
  expect(pageOf(pages, "lib/known-limitations").markdown.trim()).toBe("None.")
})

test("the sidebar has a group per published README, labelled by its H1 and listing its pages in README order", () => {
  const readme = "# my-lib\n\n## Getting started\n\nInstall.\n\n## Design decisions\n\nPrinciples."

  const { sidebar } = libSite({ "packages/lib/README.md": readme })

  expect(sidebar).toEqual([
    { label: "my-lib", items: [{ slug: "lib/getting-started" }, { slug: "lib/design-decisions" }] }
  ])
})

test("the home page actions point to the pages of the published READMEs", () => {
  const rootReadme =
    "# repo\n\nA repo.\n\n```ts\nlib\n```\n\n## Documentation\n\n[lib](packages/lib/README.md) is the library."

  const { home } = repositorySite(
    inMemoryRepository({ "README.md": rootReadme, "packages/lib/README.md": libReadme("## Getting started\n\nGo.") }),
    { ...site, home: "README.md", readmes: [{ path: "packages/lib/README.md", route: "lib" }] }
  )

  expect(home?.hero.actions).toEqual([{ text: "lib", link: "/docs/lib/getting-started/", variant: "primary" }])
})

const twoPackageSite = (files: Record<string, string>) =>
  repositorySite(inMemoryRepository(files), {
    ...site,
    readmes: [
      { path: "packages/lib/README.md", route: "lib" },
      { path: "packages/extras/README.md", route: "extras" }
    ]
  })

const extrasReadme = "# extras\n\n## Getting started\n\nInstall.\n\n## Tracing\n\nSpans.\n\n### Attributes\n\nTable."

test("a relative link to a published README points to its first page", () => {
  const readme = libReadme("## Getting started\n\nSee [extras](../extras/README.md).")

  const { pages } = twoPackageSite({ "packages/lib/README.md": readme, "packages/extras/README.md": extrasReadme })

  expect(pageOf(pages, "lib/getting-started").markdown.trim()).toBe("See [extras](/docs/extras/getting-started/).")
})

test.each([
  ["a section of another README to its page", "../extras/README.md#tracing", "/docs/extras/tracing/"],
  [
    "a subsection of another README to its anchor on the page",
    "../extras/README.md#attributes",
    "/docs/extras/tracing/#attributes"
  ],
  ["a section of the same README to its page", "#known-limitations", "/docs/lib/known-limitations/"]
])("a relative link to %s", (_, url, route) => {
  const readme = libReadme(`## Getting started\n\nSee [it](${url}).\n\n## Known limitations\n\nNone.`)

  const { pages } = twoPackageSite({ "packages/lib/README.md": readme, "packages/extras/README.md": extrasReadme })

  expect(pageOf(pages, "lib/getting-started").markdown.trim()).toBe(`See [it](${route}).`)
})

test.each([
  ["an unpublished file to the file on GitHub", "../../LICENSE", "https://github.com/acme/repo/blob/main/LICENSE"],
  [
    "an unpublished file anchor to the anchor on GitHub",
    "../../CONTRIBUTING.md#tests",
    "https://github.com/acme/repo/blob/main/CONTRIBUTING.md#tests"
  ],
  ["a folder to the folder on GitHub", "./examples", "https://github.com/acme/repo/tree/main/packages/lib/examples"]
])("a relative link to %s", (_, url, githubUrl) => {
  const readme = libReadme(`## Getting started\n\nSee [it](${url}).`)

  const { pages } = libSite({
    "packages/lib/README.md": readme,
    "packages/lib/examples/find.ts": "",
    "LICENSE": "MIT",
    "CONTRIBUTING.md": "## Tests"
  })

  expect(pageOf(pages, "lib/getting-started").markdown.trim()).toBe(`See [it](${githubUrl}).`)
})

test("a relative link to a folder whose README is published points to the README first page", () => {
  const readme = libReadme("## Getting started\n\nSee the [examples](./examples/).")

  const { pages } = repositorySite(
    inMemoryRepository({
      "packages/lib/README.md": readme,
      "packages/lib/examples/README.md": "# Examples\n\n## Running examples\n\nRun them."
    }),
    {
      ...site,
      readmes: [
        { path: "packages/lib/README.md", route: "lib" },
        { path: "packages/lib/examples/README.md", route: "lib/examples" }
      ]
    }
  )

  expect(pageOf(pages, "lib/getting-started").markdown.trim()).toBe(
    "See the [examples](/docs/lib/examples/running-examples/)."
  )
})

test.each([
  ["a missing file", "../missing/README.md"],
  ["a missing anchor of a published README", "#missing"]
])("fails when a relative link targets %s", (_, url) => {
  const readme = libReadme(`## Getting started\n\nSee [it](${url}).`)

  expect(() => libSite({ "packages/lib/README.md": readme })).toThrow(
    `packages/lib/README.md links to ${url}, which does not resolve`
  )
})

test("absolute links are kept as they are", () => {
  const readme = libReadme("## Getting started\n\nSee [Effect](https://effect.website/docs).")

  const { pages } = libSite({ "packages/lib/README.md": readme })

  expect(pageOf(pages, "lib/getting-started").markdown.trim()).toBe("See [Effect](https://effect.website/docs).")
})

test("a page promotes its subsections by one level, since the section heading becomes the page title", () => {
  const readme = libReadme(
    "## Design decisions\n\nPrinciples.\n\n### Cursors\n\nStreams.\n\n#### Results\n\nPartitioned."
  )

  const { pages } = libSite({ "packages/lib/README.md": readme })

  expect(pageOf(pages, "lib/design-decisions").markdown.trim()).toBe(
    "Principles.\n\n## Cursors\n\nStreams.\n\n### Results\n\nPartitioned."
  )
})

const rootReadme = (sections: string) => `# repo\n\nA repo.\n\n${sections}`

test("a published ## section becomes a single page at its route, titled by its heading", () => {
  const readme = rootReadme("## Documentation\n\nDocs.\n\n## Compatibility\n\n### Effect\n\nv4.\n\n## License\n\nMIT.")

  const { pages } = repositorySite(inMemoryRepository({ "README.md": readme }), {
    ...site,
    readmes: [],
    pages: [{ path: "README.md", section: "Compatibility", route: "compatibility", placement: "top" }]
  })

  expect(pages.map(({ id, markdown, title }) => ({ id, title, markdown: markdown.trim() }))).toEqual([
    { id: "compatibility", title: "Compatibility", markdown: "## Effect\n\nv4." }
  ])
})

test("a published file without a section becomes a single page titled by its H1, keeping its intro and headings", () => {
  const contributing = "# Contributing\n\nWelcome.\n\n## Initial setup\n\nInstall.\n\n### Tools\n\nNode."

  const { pages } = repositorySite(inMemoryRepository({ "CONTRIBUTING.md": contributing }), {
    ...site,
    readmes: [],
    pages: [{ path: "CONTRIBUTING.md", route: "contributing", placement: "bottom" }]
  })

  expect(pages.map(({ id, markdown, title }) => ({ id, title, markdown: markdown.trim() }))).toEqual([
    {
      id: "contributing",
      title: "Contributing",
      markdown: "Welcome.\n\n## Initial setup\n\nInstall.\n\n### Tools\n\nNode."
    }
  ])
})

test("the sidebar lists the Overview, then the top pages, the README groups and the bottom pages", () => {
  const readme = rootReadme(
    "```ts\nrepo\n```\n\n## Documentation\n\n[lib](packages/lib/README.md).\n\n## Compatibility\n\nv4."
  )

  const { sidebar } = repositorySite(
    inMemoryRepository({
      "README.md": readme,
      "CONTRIBUTING.md": "# Contributing\n\nWelcome.",
      "packages/lib/README.md": libReadme("## Getting started\n\nGo.")
    }),
    {
      ...site,
      home: "README.md",
      readmes: [{ path: "packages/lib/README.md", route: "lib" }],
      pages: [
        { path: "CONTRIBUTING.md", route: "contributing", placement: "bottom" },
        { path: "README.md", section: "Compatibility", route: "compatibility", placement: "top" }
      ]
    }
  )

  expect(sidebar).toEqual([
    { label: "Overview", slug: "index" },
    { slug: "compatibility" },
    { label: "lib", items: [{ slug: "lib/getting-started" }] },
    { slug: "contributing" }
  ])
})

const singlePagesSite = (libSections: string) =>
  repositorySite(
    inMemoryRepository({
      "README.md": rootReadme("## Compatibility\n\n### Effect\n\nv4.\n\n## License\n\nMIT."),
      "CONTRIBUTING.md": "# Contributing\n\n- [Tests](#tests)\n\n## Tests\n\nRun them.",
      "packages/lib/README.md": libReadme(libSections)
    }),
    {
      ...site,
      readmes: [{ path: "packages/lib/README.md", route: "lib" }],
      pages: [
        { path: "README.md", section: "Compatibility", route: "compatibility", placement: "top" },
        { path: "CONTRIBUTING.md", route: "contributing", placement: "bottom" }
      ]
    }
  )

test.each([
  ["a published file to its page", "../../CONTRIBUTING.md", "/docs/contributing/"],
  [
    "a heading of a published file to its anchor on the page",
    "../../CONTRIBUTING.md#tests",
    "/docs/contributing/#tests"
  ],
  ["a published section to its page", "../../README.md#compatibility", "/docs/compatibility/"],
  [
    "a subsection of a published section to its anchor on the page",
    "../../README.md#effect",
    "/docs/compatibility/#effect"
  ]
])("a relative link to %s", (_, url, route) => {
  const { pages } = singlePagesSite(`## Getting started\n\nSee [it](${url}).`)

  expect(pageOf(pages, "lib/getting-started").markdown.trim()).toBe(`See [it](${route}).`)
})

test("a published file links to its own headings on its page", () => {
  const { pages } = singlePagesSite("## Getting started\n\nGo.")

  expect(pageOf(pages, "contributing").markdown).toContain("- [Tests](/docs/contributing/#tests)")
})

test("a relative link to an unpublished section of a published file points to GitHub", () => {
  const { pages } = singlePagesSite("## Getting started\n\nSee [it](../../README.md#license).")

  expect(pageOf(pages, "lib/getting-started").markdown.trim()).toBe(
    "See [it](https://github.com/acme/repo/blob/main/README.md#license)."
  )
})
