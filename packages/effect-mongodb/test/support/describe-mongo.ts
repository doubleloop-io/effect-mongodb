import * as Effect from "effect/Effect"
import type { Db } from "mongodb"
import { MongoClient } from "mongodb"
import { afterAll, beforeAll, describe, inject } from "vitest"

type MongoContext = {
  client: Effect.Effect<MongoClient>
  database: Effect.Effect<Db>
  _client: () => MongoClient
  _database: () => Db
}

export const describeMongo = (
  suiteName: string,
  tests: (ctx: MongoContext) => void
) => {
  describe(suiteName, () => {
    let client: MongoClient
    let database: Db
    let databaseName: string

    beforeAll(async () => {
      client = new MongoClient(inject("mongoConnectionString"), {
        directConnection: true
      })
      await client.connect()

      // https://www.mongodb.com/docs/v5.2/reference/limits/#mongodb-limit-Database-Name-Case-Sensitivity
      databaseName = suiteName.replace(/[/\\. "$*<>:|?]/g, "-")
      database = client.db(databaseName)

      const collections = await database.collections()
      await Promise.all(collections.map((x) => x.deleteMany({})))
    })

    afterAll(async () => {
      await client.close()
    })

    tests({
      _client: () => client,
      _database: () => database,
      client: Effect.sync(() => client),
      database: Effect.sync(() => database)
    })
  })
}
