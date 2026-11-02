import type { Loader, LoaderContext } from "astro/loaders"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { publishedSite } from "../site/publishedSite.ts"
import { homePage } from "./homePage.ts"

export const repositoryLoader = (): Loader => ({
  name: "repository-loader",
  load: async (context) => {
    const rootReadme = fileURLToPath(new URL("../README.md", context.config.root))
    await loadHome(context, rootReadme)

    context.watcher?.add(rootReadme)
    context.watcher?.on("change", (changed) => {
      if (changed !== rootReadme) return
      loadHome(context, rootReadme).catch((error: unknown) => context.logger.error(String(error)))
    })
  }
})

const loadHome = async (context: LoaderContext, readmePath: string) => {
  const readme = await readFile(readmePath, "utf-8")
  const page = homePage(readme, publishedSite.repositoryUrl)
  const id = "index"
  context.store.set({
    id,
    data: await context.parseData({ id, data: { title: page.title, template: "splash", hero: page.hero } }),
    body: page.snippet,
    filePath: path.relative(fileURLToPath(context.config.root), readmePath),
    rendered: await context.renderMarkdown(page.snippet),
    digest: context.generateDigest(readme)
  })
}
