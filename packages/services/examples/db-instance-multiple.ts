import * as DbInstance from "@effect-mongodb/services/DbInstance"
import * as DbService from "@effect-mongodb/services/DbService"
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"

const Todo = Schema.Struct({
  userId: Schema.Number,
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean
})

const MainDb = DbService.Tag("MainDb")
const ReplicaDb = DbService.Tag("ReplicaDb")

const program = Effect.gen(function*() {
  const mainDb = yield* MainDb
  const newDb = yield* ReplicaDb

  const collectionName = "source"
  const mainCollection = Db.collection(mainDb, collectionName, Todo)
  const replicaCollection = Db.collection(newDb, collectionName, Todo)

  const items = yield* Collection.find(mainCollection).pipe(FindCursor.toArray)

  yield* Collection.insertMany(replicaCollection, items)
})

/*** main.ts ***/

const MainDbLive = DbInstance.layer(MainDb, {
  database: { name: "mydb" },
  client: { url: "mongodb://localhost:27017" }
})

const ReplicaDbLive = DbInstance.layer(ReplicaDb, {
  database: { name: "mydb" },
  client: { url: "mongodb://localhost:37017" }
})

const MainLive = Layer.mergeAll(MainDbLive, ReplicaDbLive)

await program.pipe(
  Effect.provide(MainLive),
  Effect.runPromise
)
