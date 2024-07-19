import type { Db } from "mongodb"
import { MongoClient } from "mongodb"
import { beforeAll, beforeEach, inject } from "vitest"

type MongoContext = {
  client: () => MongoClient
  database: () => Db
}

export const describeMongo = (suiteName: string, tests: (ctx: MongoContext) => void) => {
  let client: MongoClient
  let database: Db
  let databaseName: string

  beforeAll(async () => {
    client = await MongoClient.connect(inject("mongoConnectionString"), { directConnection: true })
    await client.connect()

    // https://www.mongodb.com/docs/v5.2/reference/limits/#mongodb-limit-Database-Name-Case-Sensitivity
    databaseName = suiteName.replace(/[/\\. "$*<>:|?]/g, "-")
    database = client.db(databaseName)
  })

  beforeEach(async () => {
    const collections = await database.collections()
    await Promise.all(collections.map((x) => database.dropCollection(x.collectionName)))
  })

  tests({ client: () => client, database: () => database })
}