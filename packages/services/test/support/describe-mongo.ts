import type * as Db from "effect-mongodb/Db"
import * as MongoClient from "effect-mongodb/MongoClient"
import * as Effect from "effect/Effect"
import type { Db as Db_ } from "mongodb"
import { MongoClient as MongoClient_ } from "mongodb"
import { afterAll, beforeAll, describe, inject } from "vitest"

type MongoContext = {
  client: Effect.Effect<MongoClient_>
  database: Effect.Effect<Db.Db>
  _client: () => MongoClient_
  _database: () => Db_
}

export const describeMongo = (
  suiteName: string,
  tests: (ctx: MongoContext) => void
) => {
  describe(suiteName, () => {
    let client: MongoClient_
    let database: Db_
    let databaseName: string

    beforeAll(async () => {
      client = new MongoClient_(inject("mongoConnectionString"), {
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
      database: Effect.sync(() => MongoClient.db(new MongoClient.MongoClient({ client }), databaseName))
    })
  })
}
