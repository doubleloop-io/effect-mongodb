import * as Collection from "@doubleloop-io/effect-mongodb/Collection"
import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as DocumentCollection from "@doubleloop-io/effect-mongodb/DocumentCollection"
import * as DocumentFindCursor from "@doubleloop-io/effect-mongodb/DocumentFindCursor"
import * as FindCursor from "@doubleloop-io/effect-mongodb/FindCursor"
import * as MongoClient from "@doubleloop-io/effect-mongodb/MongoClient"
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"

const MyType = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  birthday: Schema.Date
})
type MyType = Schema.Schema.Type<typeof MyType>

const program = Effect.gen(function*(_) {
  const sourceInstance = yield* _(MongoClient.connect("mongodb://localhost:27017"))
  const sourceDb = yield* _(MongoClient.db(sourceInstance, "source"))
  const sourceCollection = yield* _(Db.documentCollection(sourceDb, "records"))
  const sourceItems = yield* _(
    DocumentCollection.find(sourceCollection),
    DocumentFindCursor.typed(MyType),
    FindCursor.toArray
  )

  const destinationInstance = yield* _(MongoClient.connect("mongodb://localhost:27017"))
  const destinationDb = yield* _(MongoClient.db(destinationInstance, "destination"))
  const destinationCollection = yield* _(Db.collection(destinationDb, "records", MyType))

  yield* _(Collection.insertMany(destinationCollection, sourceItems))
})

await program.pipe(Effect.runPromise)
