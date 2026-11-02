import * as DbInstance from "@effect-mongodb/services/DbInstance"
import * as DbService from "@effect-mongodb/services/DbService"
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"

/**
 * Db instance
 *
 * Highlights:
 * Use `DbInstance.layerEffect` to build a `DbService` layer from an effectful configuration,
 * reading the database name and connection string with `Config`
 * (set `MONGO_DATABASE_NAME` and `MONGO_CONNECTION_STRING` before running it).
 * The program only depends on the `MyDb` service, not on how the connection is created.
 */
const Todo = Schema.Struct({
  userId: Schema.Number,
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean
})

const MyDb = DbService.Service("MyDb")

const program = Effect.gen(function*() {
  const db = yield* MyDb
  const sourceCollection = Db.collection(db, "source", Todo)
  const destinationCollection = Db.collection(db, "destination", Todo)

  const items = yield* Collection.find(sourceCollection).pipe(FindCursor.toArray)

  yield* Collection.insertMany(destinationCollection, items)
})

/*** main.ts ***/

const MyDbLive = DbInstance.layerEffect(
  MyDb,
  Effect.gen(function*() {
    const databaseName = yield* Config.String("MONGO_DATABASE_NAME")
    const clientUrl = yield* Config.String("MONGO_CONNECTION_STRING")
    return {
      database: { name: databaseName },
      client: { url: clientUrl, timeoutMS: 5000 }
    }
  })
)

await program.pipe(
  Effect.provide(MyDbLive),
  Effect.runPromise
)
