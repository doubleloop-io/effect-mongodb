import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as MongoClient from "effect-mongodb/MongoClient"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

/**
 * Project
 *
 * Highlights:
 * The `FindCursor.project` function requires a new schema as a parameter
 * because, in most cases, the projection result will differ from the original schema.
 */
const program = Effect.gen(function*() {
  const sourceInstance = yield* MongoClient.connectScoped("mongodb://localhost:27017")
  const sourceDb = MongoClient.db(sourceInstance, "project")
  const sourceCollection = Db.collection(sourceDb, "records", MyType)
  yield* Collection.insertMany(sourceCollection, [
    { id: 1, values: [1, 20, 13] },
    { id: 2, values: [4, 5] },
    { id: 3, values: [1, 5, 33, 96] }
  ])

  const items = yield* Collection.find(sourceCollection).pipe(
    FindCursor.project(MyTypeProjection, {
      id: 1,
      valuesCount: { $size: "$values" },
      valuesMax: { $max: "$values" }
    }),
    FindCursor.toArray
  )

  yield* Console.log(items)
})

const MyType = Schema.Struct({
  id: Schema.Int,
  values: Schema.Array(Schema.Int)
})

const MyTypeProjection = Schema.Struct({
  id: Schema.Int,
  valuesCount: Schema.Int,
  valuesMax: Schema.Int
})

await program.pipe(Effect.scoped, Effect.runPromise)
