import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as MongoClient from "effect-mongodb/MongoClient"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const MyType = Schema.Struct({
  id: Schema.Int,
  values: Schema.Array(Schema.Int)
})

const MyTypeProjection = Schema.Struct({
  id: Schema.Int,
  valuesCount: Schema.Int,
  valuesMax: Schema.Int
})

const mongoClient = (url: string) =>
  Effect.acquireRelease(
    MongoClient.connect(url),
    (client) => MongoClient.close(client).pipe(Effect.orDie)
  )

const program = Effect.gen(function*(_) {
  const sourceInstance = yield* _(mongoClient("mongodb://localhost:27017"))
  const sourceDb = MongoClient.db(sourceInstance, "project")
  const sourceCollection = Db.collection(sourceDb, "records", MyType)
  yield* _(Collection.insertMany(sourceCollection, [
    { id: 1, values: [1, 20, 13] },
    { id: 2, values: [4, 5] },
    { id: 3, values: [1, 5, 33, 96] }
  ]))

  const items = yield* _(
    Collection.find(sourceCollection),
    FindCursor.project(MyTypeProjection, {
      id: 1,
      valuesCount: { $size: "$values" },
      valuesMax: { $max: "$values" }
    }),
    FindCursor.toArray
  )

  yield* _(Console.log(items))
})

await program.pipe(Effect.scoped, Effect.runPromise)
