import * as Db from "effect-mongodb/Db"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as DocumentFindCursor from "effect-mongodb/DocumentFindCursor"
import * as Chunk from "effect/Chunk"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("DocumentFindCursor", (ctx) => {
  test("acceptance test", async () => {
    const beforeJuly = "2024-07-01T00:00:00.000Z"

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = Db.documentCollection(db, "acceptance-test")

      yield* _(
        DocumentCollection.insertMany(collection, [
          { id: 2, type: "Admin", createdOn: "2024-06-26T21:15:00.000Z" },
          { id: 3, type: "User", createdOn: "2024-07-26T09:30:00.000Z" },
          { id: 1, type: "User", createdOn: "2024-04-19T17:45:00.000Z" },
          { id: 5, type: "User", createdOn: "2024-05-26T09:30:00.000Z" },
          { id: 4, type: "User", createdOn: "2024-07-05T15:00:00.000Z" }
        ])
      )

      return yield* _(
        DocumentCollection.find(collection),
        DocumentFindCursor.filter({ createdOn: { $lt: beforeJuly } }),
        DocumentFindCursor.sort("createdOn", "ascending"),
        DocumentFindCursor.project({ _id: 0, id: 1 }),
        DocumentFindCursor.limit(2),
        DocumentFindCursor.toArray
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([{ id: 1 }, { id: 5 }])
  })

  test("stream", async () => {
    const users = [
      { id: 1, type: "User" },
      { id: 2, type: "Admin" },
      { id: 3, type: "User" },
      { id: 4, type: "Admin" }
    ]
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)

      const collection = Db.documentCollection(db, "stream")
      yield* _(DocumentCollection.insertMany(collection, users))

      return yield* _(
        DocumentCollection.find(collection),
        DocumentFindCursor.toStream,
        Stream.runCollect,
        Effect.map(Chunk.toReadonlyArray)
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(users)
  })
})
