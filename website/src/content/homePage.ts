import { toHtml } from "hast-util-to-html"
import type { Code, Heading, Link, Nodes, Paragraph, PhrasingContent, Root, RootContent } from "mdast"
import { fromMarkdown } from "mdast-util-from-markdown"
import { toHast } from "mdast-util-to-hast"
import { toString } from "mdast-util-to-string"
import type { LinkResolver } from "./siteLinks.ts"
import { sectionMarkdown } from "./splitReadme.ts"

export const homePage = (readme: string, resolveLink: LinkResolver) => {
  const tree = fromMarkdown(readme)
  const title = toString(h1(tree))
  const documentation = section(tree, "Documentation")
  const descriptions = markdownHtml(sectionMarkdown(readme, documentation, resolveLink))
  const snippet = sourceOf(readme, firstCodeBlock(tree))
  return {
    title,
    hero: { title, tagline: phrasingHtml(tagline(tree)), actions: actions(tree, resolveLink), descriptions },
    snippet
  }
}

const h1 = (tree: Root) => {
  const heading = tree.children.find((node): node is Heading => node.type === "heading" && node.depth === 1)
  if (heading === undefined) throw new Error("The README must have an H1 title")
  return heading
}

const tagline = (tree: Root) => {
  const phrasing = intro(tree)
    .filter((node): node is Paragraph => node.type === "paragraph")
    .map(({ children }) => children.filter((child) => !isBadgeOrBlank(child)))
    .find((children) => children.length > 0)
  if (phrasing === undefined) throw new Error("The README must have a tagline paragraph before its first section")
  return phrasing
}

const intro = (tree: Root) => {
  const firstSection = tree.children.findIndex((node) => node.type === "heading" && node.depth === 2)
  return tree.children.slice(0, firstSection === -1 ? undefined : firstSection)
}

const firstCodeBlock = (tree: Root) => {
  const code = tree.children.find((node): node is Code => node.type === "code")
  if (code === undefined) throw new Error("The README must have a code block")
  return code
}

const sourceOf = (markdown: string, node: Code) =>
  markdown.slice(node.position?.start.offset, node.position?.end.offset)

const isBadgeOrBlank = (node: PhrasingContent): boolean =>
  node.type === "image"
  || (node.type === "link" && node.children.every(isBadgeOrBlank))
  || (node.type === "text" && node.value.trim() === "")

const markdownHtml = (markdown: string) => toHtml(toHast(fromMarkdown(markdown)))

const phrasingHtml = (phrasing: Array<PhrasingContent>) => {
  const paragraph = toHast({ type: "paragraph", children: phrasing })
  return toHtml("children" in paragraph ? paragraph.children : paragraph).trim()
}

const actions = (tree: Root, resolveLink: LinkResolver) =>
  section(tree, "Documentation").flatMap(links).map((link, index) => ({
    text: toString(link),
    link: resolveLink(link.url),
    variant: index === 0 ? "primary" as const : "secondary" as const
  }))

const section = (tree: Root, heading: string) => {
  const start = tree.children.findIndex((node) =>
    node.type === "heading" && node.depth === 2 && toString(node) === heading
  )
  if (start === -1) throw new Error(`The README must have a "## ${heading}" section`)
  const end = tree.children.findIndex((node, index) => index > start && node.type === "heading" && node.depth <= 2)
  return tree.children.slice(start + 1, end === -1 ? undefined : end)
}

const links = (node: Nodes | RootContent): Array<Link> =>
  node.type === "link" ? [node] : "children" in node ? node.children.flatMap(links) : []
