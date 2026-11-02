import { publishedSite } from "../site/publishedSite.ts"
import { fileSystemRepository } from "./repository.ts"
import { repositorySite, type SiteOptions } from "./repositorySite.ts"

/** The repository files the site publishes, in sidebar order. */
export const publishedContent: SiteOptions = {
  base: publishedSite.base,
  repositoryUrl: publishedSite.repositoryUrl,
  home: "README.md",
  readmes: [
    { path: "packages/effect-mongodb/README.md", route: "effect-mongodb" }
  ]
}

export const publishedRepositorySite = (repositoryRoot: string) =>
  repositorySite(fileSystemRepository(repositoryRoot), publishedContent)
