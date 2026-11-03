/* eslint-disable no-undef */
import * as fs from "node:fs"
import * as path from "node:path"

const dir = ".changeset"
const frontmatter = /^---\n([\s\S]*?)\n---/
const bump = /^"[^"]+":\s*(\w+)\s*$/

const invalid = fs.readdirSync(dir)
  .filter((file) => file.endsWith(".md") && file !== "README.md")
  .flatMap((file) => {
    const content = fs.readFileSync(path.join(dir, file), "utf8")
    const header = content.match(frontmatter)?.[1] ?? ""
    return header.split("\n")
      .map((line) => line.match(bump)?.[1])
      .filter((type) => type !== undefined && type !== "patch")
      .map((type) => `${file}: ${type}`)
  })

if (invalid.length) {
  console.error("Only patch changesets are allowed on this maintenance branch")
  console.error(invalid.join("\n"))
  process.exit(1)
}
