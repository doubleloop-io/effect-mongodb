import * as DbService from "@effect-mongodb/services/DbService"
import * as MongoClientService from "@effect-mongodb/services/MongoClientService"
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const Todo = Schema.Struct({
  userId: Schema.Number,
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean
})

const MainDb = DbService.Tag("MainDb")
const ReplicaDb = DbService.Tag("ReplicaDb")

const program = Effect.gen(function*(_) {
  const mainDb = yield* MainDb
  const newDb = yield* ReplicaDb

  const collectionName = "source"
  const mainCollection = Db.collection(mainDb, collectionName, Todo)
  const replicaCollection = Db.collection(newDb, collectionName, Todo)

  const items = yield* Collection.find(mainCollection).pipe(FindCursor.toArray)

  yield* Collection.insertMany(replicaCollection, items)
})

/*** main.ts ***/

const MainMongoClient = MongoClientService.Tag("MainMongoClient")
const MainDbLive = DbService.layer(MainDb, MainMongoClient, "mydb")
const MainMongoClientLive = MongoClientService.layer(MainMongoClient, "mongodb://localhost:27017")

const ReplicaMongoClient = MongoClientService.Tag("ReplicaMongoClient")
const ReplicaDbLive = DbService.layer(ReplicaDb, ReplicaMongoClient, "mydb")
const ReplicaMongoClientLive = MongoClientService.layer(ReplicaMongoClient, "mongodb://localhost:37017")

await program.pipe(
  Effect.provide(MainDbLive),
  Effect.provide(MainMongoClientLive),
  Effect.provide(ReplicaDbLive),
  Effect.provide(ReplicaMongoClientLive),
  Effect.runPromise
)
