import * as DbInstance from "@effect-mongodb/services/DbInstance"
import * as DbService from "@effect-mongodb/services/DbService"
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { MongoClient } from "mongodb"

const Todo = Schema.Struct({
  userId: Schema.Number,
  id: Schema.Number,
  title: Schema.String,
  completed: Schema.Boolean
})

const MyDb = DbService.Tag("MyDb")

const program = Effect.gen(function*() {
  const db = yield* MyDb
  const sourceCollection = Db.collection(db, "source", Todo)
  const destinationCollection = Db.collection(db, "destination", Todo)

  const items = yield* Collection.find(sourceCollection).pipe(FindCursor.toArray)

  yield* Collection.insertMany(destinationCollection, items)
})

/*** main.ts ***/

const MyDbLive = DbInstance.fromMongoClient(
  MyDb,
  Effect.gen(function*() {
    const client = yield* Effect.promise(() => LegacyConnectionPool.mongoClient("mongodb://localhost:27017"))
    return { database: { name: "mydb" }, client }
  })
)

await program.pipe(
  Effect.provide(MyDbLive),
  Effect.runPromise
)

class LegacyConnectionPool {
  private static instance: MongoClient | null = null

  static async mongoClient(url: string) {
    if (!this.instance) {
      this.instance = new MongoClient(url)
      await this.instance.connect()
    }
    return this.instance
  }
}
