import * as DbService from "@effect-mongodb/services/DbService"
import * as MongoClientService from "@effect-mongodb/services/MongoClientService"
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const Person = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  birthday: Schema.Date
})

const MyDb = DbService.Tag("MyDb")

const program = Effect.gen(function*(_) {
  const db = yield* MyDb
  const sourceCollection = Db.collection(db, "source", Person)
  const destinationCollection = Db.collection(db, "destination", Person)

  const items = yield* Collection.find(sourceCollection).pipe(FindCursor.toArray)

  yield* Collection.insertMany(destinationCollection, items)
})

/*** main.ts ***/

const MyMongoClient = MongoClientService.Tag("MyMongoClient")
const MyDbLive = DbService.layer(MyDb, MyMongoClient, "mydb")
const MyMongoClientLive = MongoClientService.layer(MyMongoClient, "mongodb://localhost:27017")

await program.pipe(
  Effect.provide(MyDbLive),
  Effect.provide(MyMongoClientLive),
  Effect.runPromise
)
