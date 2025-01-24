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

/**
 * Elaborate stream with partitioned errors
 *
 * Highlights:
 * Use `toStreamEither` or `toArrayEither` to prevent the Stream/Effect from short-circuiting when the first error occur.
 * In this example, we log the error and continue processing the remaining documents.
 */
const program = Effect.gen(function*() {
  const sourceInstance = yield* MongoClient.connectScoped("mongodb://localhost:27017")
  const sourceDb = MongoClient.db(sourceInstance, "elaborate-stream-with-partitioned-errors")
  const sourceCollection = Db.documentCollection(sourceDb, "records")
  yield* DocumentCollection.insertMany(sourceCollection, [
    { name: "User 1", age: 30, birthday: "1994-03-10T00:00:00Z" },
    { name: "User 2", age: "24", birthday: "2000-04-25T00:00:00Z" },
    { name: "User 3", age: 29, birthday: "802828800000" },
    { name: "User 4", age: 80, birthday: "1944-07-21T00:00:00Z" },
    { name: "User 5", age: 4, birthday: "2020-11-03T00:00:00Z" },
    { name: "User 6", age: 30, birthday: "19940310T000000Z" }
  ])

  yield* DocumentCollection.find(sourceCollection).pipe(
    DocumentFindCursor.typed(MyType),
    FindCursor.toStreamEither,
    Stream.mapEffect(
      E.match({
        onLeft: ([document, error]) =>
          ParseResult.TreeFormatter.formatError(error).pipe(
            Effect.flatMap((error) => Effect.logError(`Unable to decode item`, { document, error }))
          ),
        onRight: (x) => Effect.log(`Elaborated ${x.name}`)
      })
    ),
    Stream.runDrain
  )
})

const MyType = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
  birthday: Schema.Date
})
type MyType = typeof MyType.Type

await program.pipe(Effect.scoped, Effect.runPromise)
