import { homePage } from "./homePage.ts"
import type { Repository } from "./repository.ts"
import { siteLinks } from "./siteLinks.ts"
import { documentBody, type ReadmeSection, sectionMarkdown, splitReadme } from "./splitReadme.ts"

/** A README whose `##` sections are published as pages under `route`. */
export type PublishedReadme = {
  readonly path: string
  readonly route: string
}

/**
 * A repository file published as a single top-level page at `route`: the whole file, or only its `##` `section`. The
 * sidebar lists it at the top or at the bottom, around the README groups.
 */
export type PublishedPage = {
  readonly path: string
  readonly route: string
  readonly section?: string
  readonly placement: "top" | "bottom"
}

export type SiteOptions = {
  readonly base: string
  readonly repositoryUrl: string
  /** The README the home page derives from. */
  readonly home?: string
  readonly readmes: ReadonlyArray<PublishedReadme>
  readonly pages?: ReadonlyArray<PublishedPage>
}

export type SitePage = {
  readonly id: string
  readonly title: string
  readonly markdown: string
  readonly sourcePath: string
}

export const repositorySite = (repository: Repository, options: SiteOptions) => {
  const readmes = options.readmes.map((published) => {
    const readme = repository.read(published.path)
    return { ...published, readme, ...splitReadme(readme) }
  })
  const singlePages = (options.pages ?? []).map((published) => {
    const markdown = repository.read(published.path)
    return { ...published, markdown, body: publishedBody(markdown, published) }
  })
  const resolveLink = siteLinks(
    repository,
    new Map([...readmes.flatMap(readmeRoutes), ...singlePages.flatMap(singlePageRoutes)]),
    options
  )
  const readmePages = readmes.flatMap(({ path, readme, route, sections }) =>
    sections.map((section): SitePage => ({
      id: pageId(route, section),
      title: section.title,
      markdown: sectionMarkdown(readme, section, (url) => resolveLink(url, path)),
      sourcePath: path
    }))
  )
  const pages = [
    ...singlePages.map(({ body, markdown, path, route, section }): SitePage => ({
      id: route,
      title: body.title,
      markdown: sectionMarkdown(markdown, body, (url) => resolveLink(url, path), {
        promoteHeadings: section !== undefined
      }),
      sourcePath: path
    })),
    ...readmePages
  ]
  const readmeGroups = readmes.map(({ route, sections, title }) => ({
    label: title,
    items: sections.map((section) => ({ slug: pageId(route, section) }))
  }))
  const homePath = options.home
  const pageLinks = (placement: PublishedPage["placement"]) =>
    singlePages.filter((page) => page.placement === placement).map(({ route }) => ({ slug: route }))
  const sidebar = [
    ...(homePath === undefined ? [] : [{ label: "Overview", slug: "index" }]),
    ...pageLinks("top"),
    ...readmeGroups,
    ...pageLinks("bottom")
  ]
  const home = homePath === undefined
    ? undefined
    : { ...homePage(repository.read(homePath), (url) => resolveLink(url, homePath)), sourcePath: homePath }
  return { home, pages, sidebar }
}

const publishedBody = (markdown: string, { path, section }: PublishedPage) => {
  if (section === undefined) return documentBody(markdown)
  const found = splitReadme(markdown).sections.find(({ title }) => title === section)
  if (found === undefined) throw new Error(`${path} has no "## ${section}" section`)
  return found
}

const pageId = (route: string, section: ReadmeSection) => `${route}/${section.slug}`

const readmeRoutes = (
  { path, route, sections }: { path: string; route: string; sections: ReadonlyArray<ReadmeSection> }
): Array<readonly [string, string]> =>
  sections.flatMap((section, index) => {
    const id = pageId(route, section)
    return [
      ...(index === 0 ? [[path, id] as const] : []),
      [`${path}#${section.slug}`, id] as const,
      ...section.anchors.map(({ pageAnchor, readmeAnchor }) =>
        [`${path}#${readmeAnchor}`, `${id}#${pageAnchor}`] as const
      )
    ]
  })

const singlePageRoutes = (
  { body, path, route, section }: PublishedPage & { body: ReadmeSection }
): Array<readonly [string, string]> => [
  ...(section === undefined ? [[path, route] as const] : []),
  [`${path}#${body.slug}`, route] as const,
  ...body.anchors.map(({ pageAnchor, readmeAnchor }) => [`${path}#${readmeAnchor}`, `${route}#${pageAnchor}`] as const)
]
