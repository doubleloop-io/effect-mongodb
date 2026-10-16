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

    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.documentCollection(db, "acceptance-test")

      yield* DocumentCollection.insertMany(collection, [
        { id: 2, type: "Admin", createdOn: "2024-06-26T21:15:00.000Z" },
        { id: 3, type: "User", createdOn: "2024-07-26T09:30:00.000Z" },
        { id: 1, type: "User", createdOn: "2024-04-19T17:45:00.000Z" },
        { id: 5, type: "User", createdOn: "2024-05-26T09:30:00.000Z" },
        { id: 4, type: "User", createdOn: "2024-07-05T15:00:00.000Z" }
      ])

      return yield* DocumentCollection.find(collection).pipe(
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
    const program = Effect.gen(function*() {
      const db = yield* ctx.database

      const collection = Db.documentCollection(db, "stream")
      yield* DocumentCollection.insertMany(collection, users)

      return yield* DocumentCollection.find(collection).pipe(
        DocumentFindCursor.toStream,
        Stream.runCollect,
        Effect.map(Chunk.toReadonlyArray)
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(users)
  })

  test("run the same cursor multiple times and read fresh data", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.documentCollection(db, "run-multiple-times")
      const cursor = DocumentCollection.find(collection).pipe(
        DocumentFindCursor.sort("id", "ascending"),
        DocumentFindCursor.project({ _id: 0 })
      )

      yield* DocumentCollection.insertMany(collection, [{ id: 1 }, { id: 2 }])
      const firstArray = yield* DocumentFindCursor.toArray(cursor)
      const firstStream = yield* DocumentFindCursor.toStream(cursor).pipe(
        Stream.runCollect,
        Effect.map(Chunk.toReadonlyArray)
      )

      yield* DocumentCollection.insertMany(collection, [{ id: 3 }])
      const secondArray = yield* DocumentFindCursor.toArray(cursor)
      const secondStream = yield* DocumentFindCursor.toStream(cursor).pipe(
        Stream.runCollect,
        Effect.map(Chunk.toReadonlyArray)
      )

      return { firstArray, firstStream, secondArray, secondStream }
    })

    const result = await Effect.runPromise(program)

    expect(result.firstArray).toEqual([{ id: 1 }, { id: 2 }])
    expect(result.firstStream).toEqual(result.firstArray)
    expect(result.secondArray).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(result.secondStream).toEqual(result.secondArray)
  })

  test("derived cursors do not affect each other", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.documentCollection(db, "derived-cursors")
      yield* DocumentCollection.insertMany(collection, [{ id: 1 }, { id: 2 }, { id: 3 }])

      const all = DocumentCollection.find(collection).pipe(
        DocumentFindCursor.sort("id", "ascending"),
        DocumentFindCursor.project({ _id: 0 })
      )
      const onlyFirst = all.pipe(DocumentFindCursor.limit(1))
      const onlyTwo = all.pipe(DocumentFindCursor.filter({ id: 2 }))
      const onlyFirstResult = yield* DocumentFindCursor.toArray(onlyFirst)
      const onlyTwoResult = yield* DocumentFindCursor.toArray(onlyTwo)
      const allResult = yield* DocumentFindCursor.toArray(all)

      return { allResult, onlyFirstResult, onlyTwoResult }
    })

    const result = await Effect.runPromise(program)

    expect(result.allResult).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(result.onlyFirstResult).toEqual([{ id: 1 }])
    expect(result.onlyTwoResult).toEqual([{ id: 2 }])
  })
})
