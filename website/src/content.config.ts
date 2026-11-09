import { docsSchema } from "@astrojs/starlight/schema"
import { z } from "astro/zod"
import { defineCollection } from "astro:content"
import { repositoryLoader } from "./content/repositoryLoader.ts"

export const collections = {
  docs: defineCollection({
    loader: repositoryLoader(),
    schema: docsSchema({ extend: z.object({ hero: z.object({ descriptions: z.string().optional() }).optional() }) })
  })
}
