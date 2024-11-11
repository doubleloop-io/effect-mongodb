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
type MyType = Schema.Schema.Type<typeof MyType>

const program = Effect.gen(function*(_) {
  const sourceInstance = yield* _(MongoClient.connect("mongodb://localhost:27017"))
  const sourceDb = MongoClient.db(sourceInstance, "source")
  const sourceCollection = Db.documentCollection(sourceDb, "records")
  const sourceItems = yield* _(
    DocumentCollection.find(sourceCollection),
    DocumentFindCursor.typed(MyType),
    FindCursor.toArray
  )

  const destinationInstance = yield* _(MongoClient.connect("mongodb://localhost:27017"))
  const destinationDb = MongoClient.db(destinationInstance, "destination")
  const destinationCollection = Db.collection(destinationDb, "records", MyType)

  yield* _(Collection.insertMany(destinationCollection, sourceItems))
})

await program.pipe(Effect.runPromise)
