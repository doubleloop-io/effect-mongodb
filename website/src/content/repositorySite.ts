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

/** A file split into `##` sections, each published as a page under `route`. */
type SectionedFile = {
  readonly path: string
  readonly route: string
  readonly sections: ReadonlyArray<ReadmeSection>
}

export const repositorySite = (repository: Repository, options: SiteOptions) => {
  const packages = options.readmes.map((published) => loadPackage(repository, published))
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

  const homePath = options.home
  const home = homePath === undefined
    ? undefined
    : { ...homePage(repository.read(homePath), (url) => resolveLink(url, homePath)), sourcePath: homePath }
  const sidebar = siteSidebar({ hasHome: home !== undefined, packages, singlePages })
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

const loadPackage = (repository: Repository, published: PublishedReadme) => ({
  ...loadReadme(repository, published),
  examples: published.examples === undefined ? undefined : loadExamples(repository, published, published.examples)
})

const loadExamples = (repository: Repository, published: PublishedReadme, files: ReadonlyArray<string>) => {
  const folder = path.join(path.dirname(published.path), "examples")
  const route = `${published.route}/examples`
  return {
    readme: loadReadme(repository, { path: path.join(folder, "README.md"), route }),
    files: files.map((file) => ({ id: `${route}/${path.parse(file).name}`, path: path.join(folder, file) }))
  }
}

const siteSidebar = ({ hasHome, packages, singlePages }: {
  hasHome: boolean
  packages: ReadonlyArray<ReturnType<typeof loadPackage>>
  singlePages: ReadonlyArray<PublishedPage>
}) => {
  const sectionItems = ({ route, sections }: SectionedFile) =>
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
  const pageLinks = (placement: PublishedPage["placement"]) =>
    singlePages.filter((page) => page.placement === placement).map(({ route }) => ({ slug: route }))
  return [
    ...(hasHome ? [{ label: "Overview", slug: "index" }] : []),
    ...pageLinks("top"),
    ...readmeGroups,
    ...pageLinks("bottom")
  ]
}

const pageId = (route: string, section: ReadmeSection) => `${route}/${section.slug}`

const readmeRoutes = ({ path, route, sections }: SectionedFile) =>
  sections.flatMap((section, index) => {
    const id = pageId(route, section)
    return [...(index === 0 ? [[path, id] as const] : []), ...sectionRoutes(path, section, id)]
  })

const singlePageRoutes = ({ body, path, route, section }: PublishedPage & { body: ReadmeSection }) => [
  ...(section === undefined ? [[path, route] as const] : []),
  ...sectionRoutes(path, body, route)
]

/** The routes of a section heading and of its subheadings, from their anchors in `path` to the page `id`. */
const sectionRoutes = (path: string, section: ReadmeSection, id: string) => [
  [`${path}#${section.slug}`, id] as const,
  ...section.anchors.map(({ pageAnchor, readmeAnchor }) => [`${path}#${readmeAnchor}`, `${id}#${pageAnchor}`] as const)
]
