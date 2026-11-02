import { docsSchema } from "@astrojs/starlight/schema"
import { defineCollection } from "astro:content"
import { repositoryLoader } from "./content/repositoryLoader.ts"

export const collections = {
  docs: defineCollection({ loader: repositoryLoader(), schema: docsSchema() })
}
