import { MongoDBContainer } from "@testcontainers/mongodb"
import type { StartedMongoDBContainer } from "@testcontainers/mongodb"
import type { TestProject } from "vitest/node"

let container: StartedMongoDBContainer | undefined

export async function setup({ provide }: TestProject) {
  container = await new MongoDBContainer("mongo:8.0.17")
    // Same as default replica set health check, but default 5s interval delays startup
    .withHealthCheck({
      test: [
        "CMD-SHELL",
        "mongosh --quiet --eval 'try { rs.status() } catch (e) { rs.initiate() } while (db.runCommand({ isMaster: 1 }).ismaster == false) { sleep(100) }'"
      ],
      interval: 250,
      timeout: 60_000,
      retries: 1000
    })
    .start()

  provide("mongoConnectionString", container.getConnectionString())
  if (process.env.EFFECT_MONGODB_DEBUG === "true") {
    console.log(
      `[EFFECT_MONGODB_DEBUG] MongoDB connection string with direct connection: '${container.getConnectionString()}'`
    )
  }
}

export async function teardown() {
  await container?.stop()
}

declare module "vitest" {
  export interface ProvidedContext {
    mongoConnectionString: string
  }
}
