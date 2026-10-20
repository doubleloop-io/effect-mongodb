import * as DbService from "@effect-mongodb/services/DbService"
import type * as MongoClientService from "@effect-mongodb/services/MongoClientService"
import * as Config from "effect/Config"
import type * as Context from "effect/Context"
import * as Effect from "effect/Effect"

declare const mongoClient: MongoClientService.Service<"MyMongoClient">
declare const usersDb: DbService.Service<"MyDb">

type SomeService = { name: string }
declare const SomeService: Context.Service<SomeService, SomeService>

// -------------------------------------------------------------------------------------
// Service
// -------------------------------------------------------------------------------------

// $ExpectType Service<"MyDb">
DbService.Service("MyDb")

// -------------------------------------------------------------------------------------
// layerEffect
// -------------------------------------------------------------------------------------

// $ExpectType Layer<DbService<"MyDb">, never, MongoClientService<"MyMongoClient">>
DbService.layerEffect(usersDb, mongoClient, Effect.succeed("mydb"))

// $ExpectType Layer<DbService<"MyDb">, ConfigError, MongoClientService<"MyMongoClient">>
DbService.layerEffect(usersDb, mongoClient, Config.String("DATABASE_NAME"))

const withRequirements = SomeService.pipe(Effect.flatMap(({ name }) => Config.String(name)))
// $ExpectType Layer<DbService<"MyDb">, ConfigError, SomeService | MongoClientService<"MyMongoClient">>
DbService.layerEffect(usersDb, mongoClient, withRequirements)

// -------------------------------------------------------------------------------------
// layer
// -------------------------------------------------------------------------------------

// $ExpectType Layer<DbService<"MyDb">, never, MongoClientService<"MyMongoClient">>
DbService.layer(usersDb, mongoClient, "mydb")
