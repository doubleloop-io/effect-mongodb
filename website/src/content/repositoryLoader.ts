import type { Loader, LoaderContext } from "astro/loaders"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { publishedRepositorySite } from "./publishedContent.ts"

export const repositoryLoader = (): Loader => ({
  name: "repository-loader",
  load: async (context) => {
    const repositoryRoot = fileURLToPath(new URL("../", context.config.root))
    const site = await loadSite(context, repositoryRoot)

    // Watching the sources of the first load: a newly published file needs a dev-server restart, like the sidebar
    const sources = new Set(
      [site.home?.sourcePath, ...site.pages.map(({ sourcePath }) => sourcePath)]
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
  const storeEntry = async (
    { body, data, digest, id, source }: {
      id: string
      data: Record<string, unknown>
      body: string
      source: string
      digest: string
    }
  ) =>
    context.store.set({
      id,
      data: await context.parseData({ id, data }),
      body,
      filePath: path.relative(fileURLToPath(context.config.root), path.join(repositoryRoot, source)),
      rendered: await context.renderMarkdown(body),
      digest: context.generateDigest(digest)
    })

  context.store.clear()
  if (site.home !== undefined) {
    const { body, hero, sourcePath, title } = site.home
    await storeEntry({
      id: "index",
      data: { title, template: "splash", hero },
      body,
      source: sourcePath,
      digest: body + JSON.stringify(hero)
    })
  }
  for (const page of site.pages) {
    await storeEntry({
      id: page.id,
      data: { title: page.title },
      body: page.markdown,
      source: page.sourcePath,
      digest: page.title + page.markdown
    })
  }
  return site
}
