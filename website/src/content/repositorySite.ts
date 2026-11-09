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
   * order, after the folder README, which is published whole as the examples overview at `<route>/examples`.
   */
  readonly examples?: ReadonlyArray<string>
}

/** A file published as a single page at `route`: the whole file, or only its `##` `section`. */
type PublishedDocument = {
  readonly path: string
  readonly route: string
  readonly section?: string
}

/** A document published as a top-level page, listed at the top or at the bottom of the sidebar, around the README groups. */
export type PublishedPage = PublishedDocument & { readonly placement: "top" | "bottom" }

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

type SidebarItem =
  | { readonly slug: string; readonly label?: string }
  | { readonly label: string; readonly items: ReadonlyArray<SidebarItem> }

/** A file split into `##` sections, each published as a page under `route`. */
type SectionedFile = {
  readonly path: string
  readonly route: string
  readonly sections: ReadonlyArray<ReadmeSection>
}

export const repositorySite = (repository: Repository, options: SiteOptions) => {
  const packages = options.readmes.map((published) => loadPackage(repository, published))
  const examples = packages.flatMap((pkg) => pkg.examples?.files ?? [])
  const singlePages = (options.pages ?? []).map((published) => loadDocument(repository, published))
  const documents = [
    ...singlePages,
    ...packages.flatMap((pkg) => pkg.examples === undefined ? [] : [pkg.examples.overview])
  ]

  const resolveLink = siteLinks(
    repository,
    new Map([
      ...packages.flatMap(readmeRoutes),
      ...examples.map(({ id, path }) => [path, id] as const),
      ...documents.flatMap(documentRoutes)
    ]),
    options
  )
  const readmePages = packages.flatMap(({ path, readme, route, sections }) =>
    sections.map((section): SitePage => ({
      id: pageId(route, section),
      title: section.title,
      markdown: sectionMarkdown(readme, section.nodes, (url) => resolveLink(url, path)),
      sourcePath: path
    }))
  )
  const examplePages = examples.map(({ id, path }): SitePage => ({
    id,
    ...examplePage(repository.read(path), path, `${options.repositoryUrl}/blob/main/${path}`),
    sourcePath: path
  }))
  const documentPages = documents.map(({ body, markdown, path, route, section }): SitePage => ({
    id: route,
    title: body.title,
    markdown: sectionMarkdown(markdown, body.nodes, (url) => resolveLink(url, path), {
      promoteHeadings: section !== undefined
    }),
    sourcePath: path
  }))
  const pages = [...documentPages, ...readmePages, ...examplePages]

  const homePath = options.home
  const home = homePath === undefined
    ? undefined
    : { ...homePage(repository.read(homePath), (url) => resolveLink(url, homePath)), sourcePath: homePath }
  const sidebar = siteSidebar({ hasHome: home !== undefined, packages, singlePages })
  return { home, pages, sidebar }
}

const loadDocument = <D extends PublishedDocument>(repository: Repository, published: D) => {
  const markdown = repository.read(published.path)
  return { ...published, markdown, body: documentSection(markdown, published) }
}

const documentSection = (markdown: string, { path, section }: PublishedDocument) => {
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
    overview: loadDocument<PublishedDocument>(repository, { path: path.join(folder, "README.md"), route }),
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
        items: [
          { label: "Overview", slug: pkg.examples.overview.route },
          ...pkg.examples.files.map(({ id }) => ({ slug: id }))
        ]
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

const documentRoutes = ({ body, path, route, section }: PublishedDocument & { body: ReadmeSection }) => [
  ...(section === undefined ? [[path, route] as const] : []),
  ...sectionRoutes(path, body, route)
]

/** The routes of a section heading and of its subheadings, from their anchors in `path` to the page `id`. */
const sectionRoutes = (path: string, section: ReadmeSection, id: string) => [
  [`${path}#${section.slug}`, id] as const,
  ...section.anchors.map(({ pageAnchor, readmeAnchor }) => [`${path}#${readmeAnchor}`, `${id}#${pageAnchor}`] as const)
]
