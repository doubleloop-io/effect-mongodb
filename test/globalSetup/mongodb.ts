import { MongoDBContainer } from "@testcontainers/mongodb"
import type { StartedMongoDBContainer } from "@testcontainers/mongodb"
import type { GlobalSetupContext } from "vitest/node"

let container: StartedMongoDBContainer | undefined

export async function setup({ provide }: GlobalSetupContext) {
  container = await new MongoDBContainer("mongo:6.0.16").start()

  provide("mongoConnectionString", container.getConnectionString())
}

export async function teardown() {
  await container?.stop()
}

declare module "vitest" {
  export interface ProvidedContext {
    mongoConnectionString: string
  }
}