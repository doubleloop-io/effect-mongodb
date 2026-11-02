import path from "node:path/posix"
import type { Repository } from "./repository.ts"

/**
 * Page ids, optionally with an `#anchor`, of published repository files, keyed by `path` or `path#anchor` relative to
 * the repository root.
 */
export type RouteTable = ReadonlyMap<string, string>

export type LinkOptions = {
  readonly base: string
  readonly repositoryUrl: string
}

/**
 * Resolves a link written in the repository file `from`: relative links point to the site route when their target is
 * published, otherwise to the target on GitHub; any other link is kept as is.
 */
export const siteLinks = (repository: Repository, routes: RouteTable, options: LinkOptions) => {
  const route = (page: string) => {
    const [id, anchor] = page.split("#")
    return `${options.base}/${id}/${anchor === undefined ? "" : `#${anchor}`}`
  }
  // A folder is published through its README, as GitHub shows it on the folder page
  const publishedPath = (target: string) => {
    const readme = path.join(target, "README.md")
    return !routes.has(target) && routes.has(readme) ? readme : target
  }
  return (url: string, from: string) => {
    if (URL.canParse(url) || url.startsWith("/")) return url
    const [file, anchor] = url.split("#")
    const target = file === "" ? from : publishedPath(path.join(path.dirname(from), file).replace(/\/$/, ""))
    const published = routes.get(anchor === undefined ? target : `${target}#${anchor}`)
    if (published !== undefined) return route(published)
    const kind = routes.has(target) ? undefined : repository.kind(target)
    if (kind === undefined) throw new Error(`${from} links to ${url}, which does not resolve`)
    const githubUrl = `${options.repositoryUrl}/${kind === "directory" ? "tree" : "blob"}/main/${target}`
    return anchor === undefined ? githubUrl : `${githubUrl}#${anchor}`
  }
}
