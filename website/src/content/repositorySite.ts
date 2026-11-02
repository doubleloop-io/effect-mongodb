import path from "node:path/posix"
import { examplePage } from "./examplePage.ts"
import { homePage } from "./homePage.ts"
import type { Repository } from "./repository.ts"
import { siteLinks } from "./siteLinks.ts"
import { documentBody, type ReadmeSection, sectionMarkdown, splitReadme } from "./splitReadme.ts"

/** A README whose `##` sections are published as pages under `route`. */
export type PublishedReadme = {
  readonly path: string
  readonly route: string
  /**
   * The files of the `examples` folder next to the README published as pages under `<route>/examples`, in sidebar
   * order, after the pages of the folder README.
   */
  readonly examples?: ReadonlyArray<string>
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

type SidebarItem = { readonly slug: string } | { readonly label: string; readonly items: ReadonlyArray<SidebarItem> }

export const repositorySite = (repository: Repository, options: SiteOptions) => {
  const packages = options.readmes.map((published) => ({
    ...loadReadme(repository, published),
    examples: published.examples === undefined ? undefined : loadExamples(repository, published, published.examples)
  }))
  const readmes = packages.flatMap((pkg) => pkg.examples === undefined ? [pkg] : [pkg, pkg.examples.readme])
  const examples = packages.flatMap((pkg) => pkg.examples?.files ?? [])
  const singlePages = (options.pages ?? []).map((published) => {
    const markdown = repository.read(published.path)
    return { ...published, markdown, body: publishedBody(markdown, published) }
  })

  const resolveLink = siteLinks(
    repository,
    new Map([
      ...readmes.flatMap(readmeRoutes),
      ...examples.map(({ id, path }) => [path, id] as const),
      ...singlePages.flatMap(singlePageRoutes)
    ]),
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
  const examplePages = examples.map(({ id, path }): SitePage => ({
    id,
    ...examplePage(repository.read(path), path, `${options.repositoryUrl}/blob/main/${path}`),
    sourcePath: path
  }))
  const pages = [
    ...singlePages.map(({ body, markdown, path, route, section }): SitePage => ({
      id: route,
      title: body.title,
      markdown: sectionMarkdown(markdown, body, (url) => resolveLink(url, path), {
        promoteHeadings: section !== undefined
      }),
      sourcePath: path
    })),
    ...readmePages,
    ...examplePages
  ]

  const sectionItems = ({ route, sections }: { route: string; sections: ReadonlyArray<ReadmeSection> }) =>
    sections.map((section) => ({ slug: pageId(route, section) }))
  const readmeGroups = packages.map((pkg) => ({
    label: pkg.title,
    items: [
      ...sectionItems(pkg),
      ...(pkg.examples === undefined ? [] : [{
        label: "Examples",
        items: [...sectionItems(pkg.examples.readme), ...pkg.examples.files.map(({ id }) => ({ slug: id }))]
      }])
    ] satisfies ReadonlyArray<SidebarItem>
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

const loadReadme = (repository: Repository, published: { path: string; route: string }) => {
  const readme = repository.read(published.path)
  return { ...published, readme, ...splitReadme(readme) }
}

const loadExamples = (repository: Repository, published: PublishedReadme, files: ReadonlyArray<string>) => {
  const folder = path.join(path.dirname(published.path), "examples")
  const route = `${published.route}/examples`
  return {
    readme: loadReadme(repository, { path: path.join(folder, "README.md"), route }),
    files: files.map((file) => ({ id: `${route}/${path.parse(file).name}`, path: path.join(folder, file) }))
  }
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
