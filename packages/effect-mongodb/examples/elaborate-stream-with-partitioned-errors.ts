import * as Db from "effect-mongodb/Db"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as DocumentFindCursor from "effect-mongodb/DocumentFindCursor"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as MongoClient from "effect-mongodb/MongoClient"
import * as Effect from "effect/Effect"
import * as E from "effect/Either"
import * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"

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

  yield* _(
    DocumentCollection.find(sourceCollection),
    DocumentFindCursor.typed(MyType),
    FindCursor.toStreamEither,
    Stream.mapEffect(
      E.match({
        onLeft: ([document, error]) =>
          ParseResult.TreeFormatter.formatError(error).pipe(
            Effect.flatMap((error) => Effect.logError(`Unable to decode item`, { document, error }))
          ),
        onRight: (x: MyType) => Effect.log(`Elaborate ${x}`)
      })
    ),
    Stream.runDrain
  )
})

await program.pipe(Effect.runPromise)
