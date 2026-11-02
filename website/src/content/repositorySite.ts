import { homePage } from "./homePage.ts"
import type { Repository } from "./repository.ts"
import { siteLinks } from "./siteLinks.ts"
import { type ReadmeSection, sectionMarkdown, splitReadme } from "./splitReadme.ts"

/** A README whose `##` sections are published as pages under `route`. */
export type PublishedReadme = {
  readonly path: string
  readonly route: string
}

export type SiteOptions = {
  readonly base: string
  readonly repositoryUrl: string
  /** The README the home page derives from. */
  readonly home?: string
  readonly readmes: ReadonlyArray<PublishedReadme>
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
  const resolveLink = siteLinks(repository, new Map(readmes.flatMap(readmeRoutes)), options)
  const pages = readmes.flatMap(({ path, readme, route, sections }) =>
    sections.map((section): SitePage => ({
      id: pageId(route, section),
      title: section.title,
      markdown: sectionMarkdown(readme, section, (url) => resolveLink(url, path)),
      sourcePath: path
    }))
  )
  const sidebar = readmes.map(({ route, sections, title }) => ({
    label: title,
    items: sections.map((section) => ({ slug: pageId(route, section) }))
  }))
  const homePath = options.home
  const home = homePath === undefined
    ? undefined
    : { ...homePage(repository.read(homePath), (url) => resolveLink(url, homePath)), sourcePath: homePath }
  return { home, pages, sidebar }
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
