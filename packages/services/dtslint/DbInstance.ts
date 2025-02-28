import * as DbInstance from "@effect-mongodb/services/DbInstance"
import type * as DbService from "@effect-mongodb/services/DbService"
import * as Config from "effect/Config"
import type * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { MongoClient as NativeMongoClient } from "mongodb"

declare const db: DbService.Tag<"MyDb">

type SomeService = { url: string; name: string }
declare const SomeService: Context.Tag<SomeService, SomeService>

// -------------------------------------------------------------------------------------
// layerEffect
// -------------------------------------------------------------------------------------

// $ExpectType Layer<DbService<"MyDb">, MongoError, never>
DbInstance.layerEffect(db, Effect.succeed({ database: { name: "mydb" }, client: { url: "mongodb://localhost:27017" } }))

// $ExpectType Layer<DbService<"MyDb">, MongoError | ConfigError, never>
DbInstance.layerEffect(
  db,
  Effect.gen(function*() {
    const databaseName = yield* Config.string("MONGO_DATABASE_NAME")
    const clientUrl = yield* Config.string("MONGO_CONNECTION_STRING")
    return { database: { name: databaseName }, client: { url: clientUrl } }
  })
)

const withRequirements = Effect.gen(function*() {
  const { url } = yield* SomeService
  const name = yield* Config.string("MONGO_DATABASE_NAME")
  return { database: { name }, client: { url } }
})
// $ExpectType Layer<DbService<"MyDb">, MongoError | ConfigError, SomeService>
DbInstance.layerEffect(db, withRequirements)

// -------------------------------------------------------------------------------------
// layer
// -------------------------------------------------------------------------------------

// $ExpectType Layer<DbService<"MyDb">, MongoError, never>
DbInstance.layer(db, { database: { name: "mydb" }, client: { url: "mongodb://localhost:27017" } })

// -------------------------------------------------------------------------------------
// fromMongoClient
// -------------------------------------------------------------------------------------

declare const legacyClient: NativeMongoClient

// $ExpectType Layer<DbService<"MyDb">, never, never>
DbInstance.fromMongoClient(db, Effect.succeed({ database: { name: "mydb" }, client: legacyClient }))

// $ExpectType Layer<DbService<"MyDb">, ConfigError, never>
DbInstance.fromMongoClient(
  db,
  F.pipe(
    Config.string("MONGO_DATABASE_NAME"),
    Effect.map((name) => ({ database: { name }, client: legacyClient }))
  )
)

// $ExpectType Layer<DbService<"MyDb">, ConfigError, SomeService>
DbInstance.fromMongoClient(
  db,
  Effect.gen(function*() {
    const { name: dbName } = yield* SomeService
    const name = yield* Config.string(dbName)
    return { database: { name }, client: legacyClient }
  })
)
