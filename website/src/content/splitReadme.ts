import GithubSlugger from "github-slugger"
import type { Definition, Heading, Link, Nodes, RootContent } from "mdast"
import { fromMarkdown } from "mdast-util-from-markdown"
import { toString } from "mdast-util-to-string"
import type { LinkResolver } from "./siteLinks.ts"

/** A heading inside a section: its anchor in the README on GitHub and its anchor on the page. */
export type SectionAnchor = {
  readonly readmeAnchor: string
  readonly pageAnchor: string
}

export type ReadmeSection = {
  readonly title: string
  /** The section heading anchor in the README on GitHub, also used as page slug. */
  readonly slug: string
  readonly anchors: ReadonlyArray<SectionAnchor>
  readonly nodes: ReadonlyArray<RootContent>
}

/**
 * Splits a README into its H1 title and its `##` sections; the content before the first section is the README intro and
 * is dropped.
 */
export const splitReadme = (readme: string) => {
  const { h1, section, tree } = parseDocument(readme, "README")
  const starts = tree.children.flatMap((node, index) => isSectionBoundary(node) ? [index] : [])
  const sections = starts.flatMap((start, position) => {
    const heading = tree.children[start]
    if (!isHeading(heading) || heading.depth !== 2) return []
    return [section(heading, tree.children.slice(start + 1, starts[position + 1]))]
  })
  return { title: toString(h1), sections }
}

/** The whole document after its H1 title, as a single section titled by the H1. */
export const documentBody = (markdown: string) => {
  const { h1, section, tree } = parseDocument(markdown, "document")
  return section(h1, tree.children.slice(tree.children.indexOf(h1) + 1))
}

const parseDocument = (markdown: string, kind: string) => {
  const tree = fromMarkdown(markdown)
  // GitHub numbers duplicated anchors across the whole document, so every heading goes through the same slugger
  const documentSlugger = new GithubSlugger()
  const documentAnchors = new Map(
    tree.children.filter(isHeading).map((heading) => [heading, documentSlugger.slug(toString(heading))])
  )
  const h1 = tree.children.find((node): node is Heading => isHeading(node) && node.depth === 1)
  if (h1 === undefined) throw new Error(`The ${kind} must have an H1 title`)
  const section = (heading: Heading, nodes: ReadonlyArray<RootContent>): ReadmeSection => {
    const pageSlugger = new GithubSlugger()
    return {
      title: toString(heading),
      slug: documentAnchors.get(heading) ?? "",
      anchors: nodes.filter(isHeading).map((subheading) => ({
        readmeAnchor: documentAnchors.get(subheading) ?? "",
        pageAnchor: pageSlugger.slug(toString(subheading))
      })),
      nodes
    }
  }
  return { h1, section, tree }
}

const isHeading = (node: RootContent): node is Heading => node.type === "heading"

const isSectionBoundary = (node: RootContent) => isHeading(node) && node.depth <= 2

type Edit = { readonly start: number; readonly end: number; readonly text: string }

/**
 * The section source, with its subsections promoted by one level, since the section heading becomes the page title,
 * and its link destinations replaced by `resolveLink`. A `documentBody` keeps its heading levels.
 */
export const sectionMarkdown = (
  readme: string,
  nodes: ReadonlyArray<RootContent>,
  resolveLink: LinkResolver,
  { promoteHeadings = true } = {}
) => {
  const start = offset(nodes[0], "start")
  const end = offset(nodes[nodes.length - 1], "end")
  if (start === undefined || end === undefined) return ""
  const edits = nodes.flatMap(descendants).flatMap((node) =>
    node.type === "heading"
      ? promoteHeadings ? promote(node) : []
      : node.type === "link" || node.type === "definition"
      ? relink(readme, node, resolveLink)
      : []
  )
  return applyEdits(readme, start, end, edits)
}

const descendants = (
  node: Nodes
): Array<Nodes> => [node, ...("children" in node ? node.children.flatMap(descendants) : [])]

const promote = (heading: Heading): Array<Edit> => {
  const start = offset(heading, "start")
  return start === undefined ? [] : [{ start, end: start + 1, text: "" }]
}

const relink = (readme: string, node: Link | Definition, resolveLink: LinkResolver): Array<Edit> => {
  const resolved = resolveLink(node.url)
  if (resolved === node.url) return []
  const nodeStart = offset(node, "start") ?? 0
  const start = readme.lastIndexOf(node.url, offset(node, "end"))
  if (start < nodeStart) throw new Error(`Cannot find the destination of the link to ${node.url} in the README source`)
  return [{ start, end: start + node.url.length, text: resolved }]
}

const offset = (node: Nodes | undefined, side: "start" | "end") => node?.position?.[side].offset

const applyEdits = (source: string, start: number, end: number, edits: ReadonlyArray<Edit>) => {
  const sorted = [...edits].sort((a, b) => a.start - b.start)
  const { cursor, text } = sorted.reduce(
    (acc, edit) => ({ cursor: edit.end, text: acc.text + source.slice(acc.cursor, edit.start) + edit.text }),
    { cursor: start, text: "" }
  )
  return text + source.slice(cursor, end)
}
