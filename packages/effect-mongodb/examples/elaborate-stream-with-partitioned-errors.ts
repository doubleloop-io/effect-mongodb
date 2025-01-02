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
type MyType = typeof MyType.Type

const mongoClient = (url: string) =>
  Effect.acquireRelease(
    MongoClient.connect(url),
    (client) => MongoClient.close(client).pipe(Effect.orDie)
  )

const program = Effect.gen(function*(_) {
  const sourceInstance = yield* _(mongoClient("mongodb://localhost:27017"))
  const sourceDb = MongoClient.db(sourceInstance, "elaborate-stream-with-partitioned-errors")
  const sourceCollection = Db.documentCollection(sourceDb, "records")
  yield* _(DocumentCollection.insertMany(sourceCollection, [
    { name: "User 1", age: 30, birthday: "1994-03-10T00:00:00Z" },
    { name: "User 2", age: "24", birthday: "2000-04-25T00:00:00Z" },
    { name: "User 3", age: 29, birthday: "802828800000" },
    { name: "User 4", age: 80, birthday: "1944-07-21T00:00:00Z" },
    { name: "User 5", age: 4, birthday: "2020-11-03T00:00:00Z" },
    { name: "User 6", age: 30, birthday: "19940310T000000Z" }
  ]))

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
        onRight: (x) => Effect.log(`Elaborated ${x.name}`)
      })
    ),
    Stream.runDrain
  )
})

await program.pipe(Effect.scoped, Effect.runPromise)
