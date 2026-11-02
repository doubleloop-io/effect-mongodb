import { publishedSite } from "../site/publishedSite.ts"
import { fileSystemRepository } from "./repository.ts"
import { repositorySite, type SiteOptions } from "./repositorySite.ts"

/** The repository files the site publishes, in sidebar order. */
export const publishedContent: SiteOptions = {
  base: publishedSite.base,
  repositoryUrl: publishedSite.repositoryUrl,
  home: "README.md",
  readmes: [
    {
      path: "packages/effect-mongodb/README.md",
      route: "effect-mongodb",
      examples: [
        "aggregate.ts",
        "project.ts",
        "find-with-cursor-builder.ts",
        "find-without-cursor-builder.ts",
        "copy-between-dbs.ts",
        "elaborate-stream-with-partitioned-errors.ts"
      ]
    }
  ]
}

export const publishedRepositorySite = (repositoryRoot: string) =>
  repositorySite(fileSystemRepository(repositoryRoot), publishedContent)
