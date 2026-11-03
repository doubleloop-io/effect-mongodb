import { defineRouteMiddleware } from "@astrojs/starlight/route-data"
import { effectV3Tag, publishedSite } from "./site/publishedSite.ts"

const versionBanner = `Docs for Effect v4 (&gt;= 0.8). For Effect v3 see <a href="${publishedSite.repositoryUrl}/tree/${
  encodeURIComponent(effectV3Tag)
}">0.7.x</a>`

export const onRequest = defineRouteMiddleware((context) => {
  context.locals.starlightRoute.entry.data.banner = { content: versionBanner }
})
