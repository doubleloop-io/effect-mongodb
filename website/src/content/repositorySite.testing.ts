import type { Repository } from "./repository.ts"
import type { SitePage } from "./repositorySite.ts"

export const linkOptions = { base: "/docs", repositoryUrl: "https://github.com/acme/repo" }

export const inMemoryRepository = (files: Record<string, string>): Repository => ({
  read: (path) => {
    const content = files[path]
    if (content === undefined) throw new Error(`No such file: ${path}`)
    return content
  },
  kind: (path) =>
    path in files ? "file" : Object.keys(files).some((file) => file.startsWith(`${path}/`)) ? "directory" : undefined
})

export const pageOf = (pages: ReadonlyArray<SitePage>, id: string) => {
  const page = pages.find((candidate) => candidate.id === id)
  if (page === undefined) throw new Error(`No page ${id} among ${pages.map(({ id }) => id).join(", ")}`)
  return page
}
