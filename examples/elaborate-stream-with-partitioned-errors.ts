import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as DocumentCollection from "@doubleloop-io/effect-mongodb/DocumentCollection"
import * as DocumentFindCursor from "@doubleloop-io/effect-mongodb/DocumentFindCursor"
import * as FindCursor from "@doubleloop-io/effect-mongodb/FindCursor"
import * as MongoClient from "@doubleloop-io/effect-mongodb/MongoClient"
import * as Schema from "@effect/schema/Schema"
import * as TreeFormatter from "@effect/schema/TreeFormatter"
import * as Effect from "effect/Effect"
import * as E from "effect/Either"
import * as Stream from "effect/Stream"

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

  yield* _(
    DocumentCollection.find(sourceCollection),
    DocumentFindCursor.typed(MyType),
    FindCursor.toStreamEither,
    Stream.mapEffect(
      E.match({
        onLeft: ([document, error]) =>
          TreeFormatter.formatError(error).pipe(
            Effect.flatMap((error) => Effect.logError(`Unable to decode item`, { document, error }))
          ),
        onRight: (x: MyType) => Effect.log(`Elaborate ${x}`)
      })
    ),
    Stream.runDrain
  )
})

await program.pipe(Effect.runPromise)
