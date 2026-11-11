import * as Db from "effect-mongodb/Db"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as ListCollectionsCursor from "effect-mongodb/ListCollectionsCursor"
import * as MongoError from "effect-mongodb/MongoError"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as O from "effect/Option"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("Db", (ctx) => {
  test("create collection", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      yield* Db.dropCollection(db, "create-collection")
      const collection = yield* Db.createCollection(db, "create-collection")

      yield* DocumentCollection.insertOne(collection, { name: "john" })

      const names = yield* F.pipe(
        Db.listCollections(db, { name: "create-collection" }, { nameOnly: true }),
        ListCollectionsCursor.toArray
      )
      const document = yield* DocumentCollection.findOne(collection, { name: "john" })

      return { names: names.map((x) => x.name), document }
    })

    const result = await Effect.runPromise(program)

    expect(result.names).toEqual(["create-collection"])
    expect(O.map(result.document, (x) => x.name)).toEqual(O.some("john"))
  })

  test("create collection with options", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      yield* Db.dropCollection(db, "create-collection-with-options")
      const [info] = yield* F.pipe(
        db,
        Db.createCollection("create-collection-with-options", { capped: true, size: 4096 }),
        Effect.flatMap(() =>
          ListCollectionsCursor.toArray(
            Db.listCollections(db, { name: "create-collection-with-options" }, { nameOnly: false })
          )
        )
      )
      return info.options
    })

    const result = await Effect.runPromise(program)

    expect(result).toMatchObject({ capped: true, size: 4096 })
  })

  test("create existing collection with different options fails", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      yield* Db.dropCollection(db, "create-existing-collection")
      yield* Db.createCollection(db, "create-existing-collection")
      return yield* Db.createCollection(db, "create-existing-collection", { capped: true, size: 4096 })
    })

    const result = await Effect.runPromise(Effect.flip(program))

    expect(result).toBeInstanceOf(MongoError.MongoError)
    expect(result.source).toMatchObject({ module: "Db", functionName: "createCollection" })
  })
})
