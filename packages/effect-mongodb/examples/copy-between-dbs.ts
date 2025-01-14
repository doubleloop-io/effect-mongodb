import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as DocumentFindCursor from "effect-mongodb/DocumentFindCursor"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as MongoClient from "effect-mongodb/MongoClient"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const MyType = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  birthday: Schema.Date
})
type MyType = typeof MyType.Type

const program = Effect.gen(function*() {
  const sourceInstance = yield* MongoClient.connectScoped("mongodb://localhost:27017")
  const sourceDb = MongoClient.db(sourceInstance, "source")
  const sourceCollection = Db.documentCollection(sourceDb, "records")
  yield* DocumentCollection.insertMany(sourceCollection, [
    { name: "User 1", age: 30, birthday: "1994-03-10T00:00:00Z" },
    { name: "User 2", age: 80, birthday: "1944-07-21T00:00:00Z" },
    { name: "User 3", age: 4, birthday: "2020-11-03T00:00:00Z" }
  ])

  const sourceItems = yield* DocumentCollection.find(sourceCollection).pipe(DocumentFindCursor.typed(MyType), FindCursor.toArray)

  const destinationInstance = yield* MongoClient.connectScoped("mongodb://localhost:27017")
  const destinationDb = MongoClient.db(destinationInstance, "destination")
  const destinationCollection = Db.collection(destinationDb, "records", MyType)

  yield* Collection.insertMany(destinationCollection, sourceItems)
})

await program.pipe(Effect.scoped, Effect.runPromise)
