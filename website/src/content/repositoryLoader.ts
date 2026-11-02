import type { Loader, LoaderContext } from "astro/loaders"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { publishedContent, publishedRepositorySite } from "./publishedContent.ts"

export const repositoryLoader = (): Loader => ({
  name: "repository-loader",
  load: async (context) => {
    const repositoryRoot = fileURLToPath(new URL("../", context.config.root))
    await loadSite(context, repositoryRoot)

    const sources = new Set(
      [
        publishedContent.home,
        ...publishedContent.readmes.map(({ path }) => path),
        ...(publishedContent.pages ?? []).map(({ path }) => path)
      ]
        .flatMap((source) => source === undefined ? [] : [path.join(repositoryRoot, source)])
    )
    sources.forEach((source) => context.watcher?.add(source))
    context.watcher?.on("change", (changed) => {
      if (!sources.has(changed)) return
      loadSite(context, repositoryRoot).catch((error: unknown) => context.logger.error(String(error)))
    })
  }
})

const loadSite = async (context: LoaderContext, repositoryRoot: string) => {
  const site = publishedRepositorySite(repositoryRoot)
  const sourcePath = (source: string) =>
    path.relative(fileURLToPath(context.config.root), path.join(repositoryRoot, source))

  context.store.clear()
  if (site.home !== undefined) {
    const id = "index"
    const { hero, snippet, sourcePath: homePath, title } = site.home
    context.store.set({
      id,
      data: await context.parseData({ id, data: { title, template: "splash", hero } }),
      body: snippet,
      filePath: sourcePath(homePath),
      rendered: await context.renderMarkdown(snippet),
      digest: context.generateDigest(snippet + JSON.stringify(hero))
    })
  }
  for (const page of site.pages) {
    context.store.set({
      id: page.id,
      data: await context.parseData({ id: page.id, data: { title: page.title } }),
      body: page.markdown,
      filePath: sourcePath(page.sourcePath),
      rendered: await context.renderMarkdown(page.markdown),
      digest: context.generateDigest(page.title + page.markdown)
    })
  }
}
