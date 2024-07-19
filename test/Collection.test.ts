import * as Collection from "@doubleloop-io/effect-mongodb/Collection"
import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as FindCursor from "@doubleloop-io/effect-mongodb/FindCursor"
import * as Effect from "effect/Effect"
import { ObjectId } from "mongodb"
import { expect, test } from "vitest"
import { describeMongo } from "./support/descrive-mongo.js"

describeMongo("Collection", (ctx) => {
  test("insert and find", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(Effect.sync(() => ctx.database()))
      const collection = yield* _(Db.collection(db, "users"))

      // FIXME: for some reason, if you don't pass the options it won't work
      yield* _(Collection.insertOne(collection, { name: "John" }, undefined))

      return yield* _(Collection.findV2(collection), FindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([{ _id: expect.any(ObjectId), name: "John" }])
  })
})
