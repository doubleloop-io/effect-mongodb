import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as DocumentCollection from "@doubleloop-io/effect-mongodb/DocumentCollection"
import * as DocumentFindCursor from "@doubleloop-io/effect-mongodb/DocumentFindCursor"
import * as Chunk from "effect/Chunk"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("DocumentFindCursor", (ctx) => {
  test("filter", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.documentCollection(db, "filter"))

      yield* _(
        DocumentCollection.insertMany(collection, [
          { id: 1, type: "User" },
          { id: 2, type: "Admin" },
          { id: 3, type: "User" },
          { id: 4, type: "Admin" }
        ])
      )

      return yield* _(
        DocumentCollection.find(collection),
        DocumentFindCursor.filter({ type: "Admin" }),
        DocumentFindCursor.toArray
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([
      expect.objectContaining({ id: 2, type: "Admin" }),
      expect.objectContaining({ id: 4, type: "Admin" })
    ])
  })

  test("project", async () => {
    const now = new Date("2024-07-26T09:30:00.000Z")

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.documentCollection(db, "project"))

      yield* _(
        DocumentCollection.insertMany(collection, [
          { id: 1, type: "User" },
          { id: 2, type: "Admin" },
          { id: 3, type: "User" }
        ])
      )

      return yield* _(
        DocumentCollection.find(collection),
        DocumentFindCursor.project({ _id: 0, id: 1, type: 1, createdTime: now }),
        DocumentFindCursor.toArray
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([
      { id: 1, type: "User", createdTime: now },
      { id: 2, type: "Admin", createdTime: now },
      { id: 3, type: "User", createdTime: now }
    ])
  })

  test("sort", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.documentCollection(db, "sort"))

      yield* _(
        DocumentCollection.insertMany(collection, [
          { id: 4 },
          { id: 2 },
          { id: 5 },
          { id: 3 },
          { id: 1 }
        ])
      )

      return yield* _(
        DocumentCollection.find(collection),
        DocumentFindCursor.sort({ id: 1 }),
        DocumentFindCursor.toArray
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: 2 }),
      expect.objectContaining({ id: 3 }),
      expect.objectContaining({ id: 4 }),
      expect.objectContaining({ id: 5 })
    ])
  })

  test("limit", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.documentCollection(db, "limit"))

      yield* _(
        DocumentCollection.insertMany(collection, [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
          { id: 5 }
        ])
      )

      return yield* _(
        DocumentCollection.find(collection),
        DocumentFindCursor.limit(3),
        DocumentFindCursor.toArray
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: 2 }),
      expect.objectContaining({ id: 3 })
    ])
  })

  test("many operations", async () => {
    const beforeJuly = "2024-07-01T00:00:00.000Z"

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.documentCollection(db, "many-operations"))

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
        DocumentFindCursor.project({ _id: 0, createdOn: 0 }),
        DocumentFindCursor.limit(2),
        DocumentFindCursor.toArray
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: 5 })
    ])
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

      const collection = yield* _(Db.documentCollection(db, "stream"))
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
