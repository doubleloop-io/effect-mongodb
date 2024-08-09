import * as Collection from "@doubleloop-io/effect-mongodb/Collection"
import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as FindCursor from "@doubleloop-io/effect-mongodb/FindCursor"
import * as MongoClient from "@doubleloop-io/effect-mongodb/MongoClient"
import * as UnknownFindCursor from "@doubleloop-io/effect-mongodb/UnknownFindCursor"
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"

const MyType = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  birthday: Schema.Date
})
type MyType = Schema.Schema.Type<typeof MyType>
type MyTypeEncoded = Schema.Schema.Encoded<typeof MyType>

const program = Effect.gen(function*(_) {
  const sourceInstance = yield* _(MongoClient.connect("mongodb://localhost:27017"))
  const sourceDb = yield* _(MongoClient.db(sourceInstance, "source"))
  const sourceCollection = yield* _(Db.collection(sourceDb, "records"))
  const sourceItems = yield* _(
    Collection.find(sourceCollection),
    UnknownFindCursor.typed(MyType),
    FindCursor.toArray
  )

  const destinationInstance = yield* _(MongoClient.connect("mongodb://localhost:27017"))
  const destinationDb = yield* _(MongoClient.db(destinationInstance, "destination"))
  const destinationCollection = yield* _(Db.collection<MyTypeEncoded>(destinationDb, "records"))

  if (sourceItems && destinationCollection) {
    // Don't bother me with unused variables!
  }
  // Collection.insertMany(destinationCollection, sourceItems)
})

await program.pipe(Effect.runPromise)
