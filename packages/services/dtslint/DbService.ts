import * as DbService from "@effect-mongodb/services/DbService"
import type * as MongoClientService from "@effect-mongodb/services/MongoClientService"
import * as Config from "effect/Config"
import type * as Context from "effect/Context"
import * as Effect from "effect/Effect"

declare const mongoClient: MongoClientService.TagType<"MyMongoClient">
declare const usersDb: DbService.Tag<"MyDb">

type SomeService = { name: string }
declare const SomeService: Context.Tag<SomeService, SomeService>

// -------------------------------------------------------------------------------------
// Tag
// -------------------------------------------------------------------------------------

// $ExpectType Tag<"MyDb">
DbService.Tag("MyDb")

// -------------------------------------------------------------------------------------
// layerEffect
// -------------------------------------------------------------------------------------

// $ExpectType Layer<DbService<"MyDb">, never, MongoClientService<"MyMongoClient">>
DbService.layerEffect(usersDb, mongoClient, Effect.succeed("mydb"))

// $ExpectType Layer<DbService<"MyDb">, ConfigError, MongoClientService<"MyMongoClient">>
DbService.layerEffect(usersDb, mongoClient, Config.string("DATABASE_NAME"))

const withRequirements = SomeService.pipe(Effect.flatMap(({ name }) => Config.string(name)))
// $ExpectType Layer<DbService<"MyDb">, ConfigError, MongoClientService<"MyMongoClient"> | SomeService>
DbService.layerEffect(usersDb, mongoClient, withRequirements)

// -------------------------------------------------------------------------------------
// layer
// -------------------------------------------------------------------------------------

// $ExpectType Layer<DbService<"MyDb">, never, MongoClientService<"MyMongoClient">>
DbService.layer(usersDb, mongoClient, "mydb")
