import * as DbService from "@effect-mongodb/services/DbService"
import * as MongoClientService from "@effect-mongodb/services/MongoClientService"
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

import * as Layer from "effect/Layer"

const Todo = Schema.Struct({
  userId: Schema.Number,
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean
})

const MyDb = DbService.Tag("MyDb")

const program = Effect.gen(function*() {
  const db = yield* MyDb
  const sourceCollection = Db.collection(db, "source", Todo)
  const destinationCollection = Db.collection(db, "destination", Todo)

  const items = yield* Collection.find(sourceCollection).pipe(FindCursor.toArray)

  yield* Collection.insertMany(destinationCollection, items)
})

/*** main.ts ***/

const MyMongoClient = MongoClientService.Tag("MyMongoClient")
const MyDbLive = DbService.layer(MyDb, MyMongoClient, "mydb")
const MyMongoClientLive = MongoClientService.layer(MyMongoClient, "mongodb://localhost:27017")

const MainLive = Layer.provide(MyDbLive, MyMongoClientLive)

await program.pipe(
  Effect.provide(MainLive),
  Effect.runPromise
)
