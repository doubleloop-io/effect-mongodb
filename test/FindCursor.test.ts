import * as Collection from "@doubleloop-io/effect-mongodb/Collection"
import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as FindCursor from "@doubleloop-io/effect-mongodb/FindCursor"
import * as Effect from "effect/Effect"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("FindCursor", (ctx) => {
  test("filter", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection(db, "filter"))

      yield* _(
        Collection.insertMany(collection, [
          { id: 1, type: "User" },
          { id: 2, type: "Admin" },
          { id: 3, type: "User" },
          { id: 4, type: "Admin" }
        ])
      )

      return yield* _(Collection.findV2(collection), FindCursor.filter({ type: "Admin" }), FindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([
      expect.objectContaining({ id: 2, type: "Admin" }),
      expect.objectContaining({ id: 4, type: "Admin" })
    ])
  })
})
