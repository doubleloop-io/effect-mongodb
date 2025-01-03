import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as MongoClient from "effect-mongodb/MongoClient"
import * as Arbitrary from "effect/Arbitrary"
import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as FastCheck from "effect/FastCheck"
import * as Schema from "effect/Schema"

const MyType = Schema.Struct({
  value: Schema.Int
})
type MyType = typeof MyType.Type

const anyMyType = Arbitrary.make(MyType)

const program = Effect.gen(function*(_) {
  const sourceInstance = yield* _(MongoClient.connectScoped("mongodb://localhost:27017"))
  const sourceDb = MongoClient.db(sourceInstance, "find-without-cursor-builder")
  const sourceCollection = Db.collection(sourceDb, "records", MyType)
  const myTypes = FastCheck.sample(anyMyType, 100)
  yield* _(Collection.insertMany(sourceCollection, myTypes))

  const items = yield* _(
    Collection.find(sourceCollection, {}, { sort: { value: -1 }, limit: 50 }),
    FindCursor.toArray
  )

  yield* _(Console.log(items))
})

await program.pipe(Effect.scoped, Effect.runPromise)
