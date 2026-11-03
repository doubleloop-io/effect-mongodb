import { expect, test } from "vitest"
import rootReadme from "../../../README.md?raw"
import { homePage } from "./homePage.ts"

const resolveLink = (url: string) => `resolved:${url}`

const readme = ({
  title = "# lib",
  intro = "A library.",
  snippet = "```ts\nconst lib = {}\n```",
  documentation = "## Documentation\n\n[lib](packages/lib/README.md) is the library."
} = {}) => [title, intro, snippet, documentation].join("\n\n")

test("takes the title from the H1", () => {
  const page = homePage(readme({ title: "# my-library" }), resolveLink)

  expect(page.title).toBe("my-library")
  expect(page.hero.title).toBe("my-library")
})

test("takes the tagline from the first paragraph after the badges, as HTML", () => {
  const intro = `[![CI](https://ci.example/badge.svg)](https://ci.example)
![npm](https://npm.example/badge.svg)

A [MongoDB](https://mongodb.example) toolkit for **Effect**.

Another paragraph.`

  const page = homePage(readme({ intro }), resolveLink)

  expect(page.hero.tagline).toBe(`A <a href="https://mongodb.example">MongoDB</a> toolkit for <strong>Effect</strong>.`)
})

test("drops badges that share the tagline paragraph", () => {
  const intro = "![npm](https://npm.example/badge.svg) A library."

  const page = homePage(readme({ intro }), resolveLink)

  expect(page.hero.tagline).toBe("A library.")
})

test("takes the snippet from the first code block", () => {
  const snippet = "```typescript\nconst answer = 42\n```\n\n```sh\nnpm install lib\n```"

  const page = homePage(readme({ snippet }), resolveLink)

  expect(page.snippet).toBe("```typescript\nconst answer = 42\n```")
})

test("turns the Documentation links into actions, the first one primary, resolving their destinations", () => {
  const documentation = `## Documentation

[core](packages/core/README.md) is the **core** package.

[extras](https://extras.example) adds extras.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).`

  const page = homePage(readme({ documentation }), resolveLink)

  expect(page.hero.actions).toEqual([
    { text: "core", link: "resolved:packages/core/README.md", variant: "primary" },
    { text: "extras", link: "resolved:https://extras.example", variant: "secondary" }
  ])
})

test.each([
  ["has no H1", { title: "" }, /H1/],
  ["has only badges before the snippet", { intro: "![npm](https://npm.example/badge.svg)" }, /tagline/],
  ["has no code block", { snippet: "" }, /code/],
  ["has no Documentation section", { documentation: "" }, /Documentation/]
])("fails when the README %s", (_, parts, error) => {
  expect(() => homePage(readme(parts), resolveLink)).toThrow(error)
})

test("the repository README yields a complete home page", () => {
  const page = homePage(rootReadme, resolveLink)

  expect(page.title).toBe("effect-mongodb")
  expect(page.hero.tagline).toMatch(/^A <a href="[^"]+">MongoDB<\/a> toolkit/)
  expect(page.snippet).toMatch(/^```typescript\n/)
  expect(page.hero.actions.map(({ text }) => text)).toEqual(["effect-mongodb", "@effect-mongodb/services"])
})
