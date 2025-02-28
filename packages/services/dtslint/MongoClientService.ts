import * as MongoClientService from "@effect-mongodb/services/MongoClientService"
import type * as MongoClient from "effect-mongodb/MongoClient"
import * as Config from "effect/Config"
import type * as Context from "effect/Context"
import * as Effect from "effect/Effect"

declare const mongoClient: MongoClientService.Tag<"MyMongoClient">

type SomeService = { url: string }
declare const SomeService: Context.Tag<SomeService, SomeService>

// -------------------------------------------------------------------------------------
// Tag
// -------------------------------------------------------------------------------------

// $ExpectType Tag<"MyMongoClient">
MongoClientService.Tag("MyMongoClient")

// -------------------------------------------------------------------------------------
// layerEffect
// -------------------------------------------------------------------------------------

// $ExpectType Layer<MongoClientService<"MyMongoClient">, MongoError, never>
MongoClientService.layerEffect(mongoClient, Effect.succeed("mongodb://localhost:27017"))

// $ExpectType Layer<MongoClientService<"MyMongoClient">, MongoError | ConfigError, never>
MongoClientService.layerEffect(mongoClient, Config.string("DATABASE_NAME"))

const withRequirements = SomeService.pipe(Effect.flatMap(({ url }) => Config.string(url)))
// $ExpectType Layer<MongoClientService<"MyMongoClient">, MongoError | ConfigError, SomeService>
MongoClientService.layerEffect(mongoClient, withRequirements)

// -------------------------------------------------------------------------------------
// layer
// -------------------------------------------------------------------------------------

// $ExpectType Layer<MongoClientService<"MyMongoClient">, MongoError, never>
MongoClientService.layer(mongoClient, "mongodb://localhost:27017")

// -------------------------------------------------------------------------------------
// fromMongoClient
// -------------------------------------------------------------------------------------

declare const legacyClient: Effect.Effect<MongoClient.MongoClient>

// $ExpectType Layer<MongoClientService<"MyMongoClient">, never, never>
MongoClientService.fromMongoClient(mongoClient, legacyClient)

declare const legacyClientWithError: Effect.Effect<MongoClient.MongoClient, Error>

// $ExpectType Layer<MongoClientService<"MyMongoClient">, Error, never>
MongoClientService.fromMongoClient(mongoClient, legacyClientWithError)

declare const legacyClientWithRequirements: Effect.Effect<MongoClient.MongoClient, Error, SomeService>

// $ExpectType Layer<MongoClientService<"MyMongoClient">, Error, SomeService>
MongoClientService.fromMongoClient(mongoClient, legacyClientWithRequirements)
