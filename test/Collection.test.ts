import * as Collection from "@doubleloop-io/effect-mongodb/Collection"
import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as FindCursor from "@doubleloop-io/effect-mongodb/FindCursor"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import { expect, test } from "vitest"
import { describeMongo } from "./support/descrive-mongo.js"

describeMongo("Collection", (ctx) => {
  test("find", async () => {
    const database = Effect.sync(ctx.database)

    const program = database.pipe(
      Effect.flatMap(Db.collection("users")),
      Effect.flatMap(F.flow(Collection.findV2, FindCursor.toArray))
    )

    const result = await Effect.runPromise(program)

    expect(result).toEqual([])
  })
})
