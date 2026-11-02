// @ts-check
import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://doubleloop-io.github.io",
  base: "/effect-mongodb",
  integrations: [
    starlight({
      title: "effect-mongodb"
    })
  ]
})
