import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as DocumentCollection from "@doubleloop-io/effect-mongodb/DocumentCollection"
import * as UnknownFindCursor from "@doubleloop-io/effect-mongodb/UnknownFindCursor"
import * as Effect from "effect/Effect"
import * as O from "effect/Option"
import { ObjectId } from "mongodb"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("DocumentCollection", (ctx) => {
  test("insert and find", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection(db, "insert-and-find"))

      yield* _(DocumentCollection.insertOne(collection, { name: "John" }))

      return yield* _(DocumentCollection.find(collection), UnknownFindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([{ _id: expect.any(ObjectId), name: "John" }])
  })

  test("insert many and find", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection(db, "insert-many-and-find"))

      yield* _(
        DocumentCollection.insertMany(collection, [{ name: "NAME_1" }, { name: "NAME_2" }, { name: "NAME_3" }])
      )

      return yield* _(DocumentCollection.find(collection), UnknownFindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([
      { _id: expect.any(ObjectId), name: "NAME_1" },
      { _id: expect.any(ObjectId), name: "NAME_2" },
      { _id: expect.any(ObjectId), name: "NAME_3" }
    ])
  })

  test("find one", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection(db, "find-one"))

      yield* _(
        DocumentCollection.insertMany(collection, [{ name: "ANY_NAME_1" }, { name: "john" }, { name: "ANY_NAME_2" }])
      )

      return yield* _(DocumentCollection.findOne(collection, { name: "john" }))
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.some({ _id: expect.any(ObjectId), name: "john" }))
  })

  test("find one - no result", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection(db, "find-one-no-result"))

      yield* _(
        DocumentCollection.insertMany(collection, [{ name: "ANY_NAME_1" }, { name: "ANY_NAME_2" }, {
          name: "ANY_NAME_2"
        }])
      )

      return yield* _(DocumentCollection.findOne(collection, { name: "john" }))
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.none())
  })
})
