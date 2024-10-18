import * as Schema from "@effect/schema/Schema"
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as Effect from "effect/Effect"
import * as O from "effect/Option"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("Collection", (ctx) => {
  test("find one", async () => {
    const user = { name: "john", birthday: new Date(1977, 11, 27) }

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = Db.collection(db, "find-one", User)

      yield* _(
        Collection.insertOne(collection, user)
      )

      return yield* _(Collection.findOne(collection, { name: "john" }))
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.some(user))
  })
})

const User = Schema.Struct({
  name: Schema.String,
  birthday: Schema.Date
})
