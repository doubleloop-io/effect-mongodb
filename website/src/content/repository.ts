import { readFileSync, statSync } from "node:fs"
import path from "node:path"

/** Read access to the repository files, by path relative to the repository root. */
export type Repository = {
  readonly read: (path: string) => string
  readonly kind: (path: string) => "file" | "directory" | undefined
}

export const fileSystemRepository = (root: string): Repository => ({
  read: (file) => readFileSync(path.join(root, file), "utf-8"),
  kind: (file) => {
    const stats = statSync(path.join(root, file), { throwIfNoEntry: false })
    return stats === undefined ? undefined : stats.isDirectory() ? "directory" : "file"
  }
})
