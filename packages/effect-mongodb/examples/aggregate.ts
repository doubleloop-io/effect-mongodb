import * as AggregationCursor from "effect-mongodb/AggregationCursor"
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as MongoClient from "effect-mongodb/MongoClient"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

const Source = Schema.Literal("A", "B", "C")

const MyType = Schema.Struct({
  id: Schema.Int,
  source: Source
})

const MyTypeAggregation = Schema.Struct({
  _id: Source,
  elements: Schema.Array(Schema.Int)
})

const mongoClient = (url: string) =>
  Effect.acquireRelease(
    MongoClient.connect(url),
    (client) => MongoClient.close(client).pipe(Effect.orDie)
  )

const program = Effect.gen(function*(_) {
  const sourceInstance = yield* _(mongoClient("mongodb://localhost:27017"))
  const sourceDb = MongoClient.db(sourceInstance, "aggregate")
  const sourceCollection = Db.collection(sourceDb, "records", MyType)
  yield* _(Collection.insertMany(sourceCollection, [
    MyType.make({ id: 1, source: "A" }),
    MyType.make({ id: 2, source: "B" }),
    MyType.make({ id: 3, source: "B" }),
    MyType.make({ id: 4, source: "C" }),
    MyType.make({ id: 5, source: "B" }),
    MyType.make({ id: 6, source: "C" }),
    MyType.make({ id: 7, source: "A" })
  ]))

  const items = yield* _(
    Collection.aggregate(sourceCollection, [
      {
        $group: {
          _id: "$source",
          elements: { $addToSet: "$id" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ], MyTypeAggregation),
    AggregationCursor.toArray
  )

  yield* _(Console.log(items))
})

await program.pipe(Effect.scoped, Effect.runPromise)
