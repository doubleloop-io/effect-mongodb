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

  test("project", async () => {
    const now = new Date("2024-07-26T09:30:00.000Z")

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection(db, "project"))

      yield* _(
        Collection.insertMany(collection, [
          { id: 1, type: "User" },
          { id: 2, type: "Admin" },
          { id: 3, type: "User" }
        ])
      )

      return yield* _(
        Collection.findV2(collection),
        FindCursor.project({ _id: 0, id: 1, type: 1, createdTime: now }),
        FindCursor.toArray
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
      const collection = yield* _(Db.collection(db, "sort"))

      yield* _(
        Collection.insertMany(collection, [
          { id: 4 },
          { id: 2 },
          { id: 5 },
          { id: 3 },
          { id: 1 }
        ])
      )

      return yield* _(
        Collection.findV2(collection),
        FindCursor.sort({ id: 1 }),
        FindCursor.toArray
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
      const collection = yield* _(Db.collection(db, "limit"))

      yield* _(
        Collection.insertMany(collection, [
          { id: 1 },
          { id: 2 },
          { id: 3 },
          { id: 4 },
          { id: 5 }
        ])
      )

      return yield* _(
        Collection.findV2(collection),
        FindCursor.limit(3),
        FindCursor.toArray
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
      const collection = yield* _(Db.collection(db, "many-operations"))

      yield* _(
        Collection.insertMany(collection, [
          { id: 2, type: "Admin", createdOn: "2024-06-26T21:15:00.000Z" },
          { id: 3, type: "User", createdOn: "2024-07-26T09:30:00.000Z" },
          { id: 1, type: "User", createdOn: "2024-04-19T17:45:00.000Z" },
          { id: 5, type: "User", createdOn: "2024-05-26T09:30:00.000Z" },
          { id: 4, type: "User", createdOn: "2024-07-05T15:00:00.000Z" }
        ])
      )

      return yield* _(
        Collection.findV2(collection),
        FindCursor.filter({ createdOn: { $lt: beforeJuly } }),
        FindCursor.sort("createdOn", "ascending"),
        FindCursor.project({ _id: 0, createdOn: 0 }),
        FindCursor.limit(2),
        FindCursor.toArray
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: 5 })
    ])
  })
})
