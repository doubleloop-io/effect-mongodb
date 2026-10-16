import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as Arbitrary from "effect/Arbitrary"
import * as Array from "effect/Array"
import * as Chunk from "effect/Chunk"
import * as Effect from "effect/Effect"
import * as FastCheck from "effect/FastCheck"
import * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("FindCursor", (ctx) => {
  test("acceptance test", async () => {
    const beforeJuly = "2024-07-01T00:00:00.000Z"

    const User = Schema.Struct({
      id: Schema.Number,
      createdOn: Schema.Date
    })
    const UserProjection = Schema.Struct({
      id: User.fields.id
    })

    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "acceptance-test", User)

      yield* Collection.insertMany(collection, [
        { id: 2, createdOn: new Date("2024-06-26T21:15:00.000Z") },
        { id: 3, createdOn: new Date("2024-07-26T09:30:00.000Z") },
        { id: 1, createdOn: new Date("2024-04-19T17:45:00.000Z") },
        { id: 5, createdOn: new Date("2024-05-26T09:30:00.000Z") },
        { id: 4, createdOn: new Date("2024-07-05T15:00:00.000Z") }
      ])

      return yield* Collection.find(collection).pipe(
        FindCursor.filter({ createdOn: { $lt: beforeJuly } }),
        FindCursor.sort("createdOn", "ascending"),
        FindCursor.project(UserProjection, { _id: 0, id: 1 }),
        FindCursor.limit(2),
        FindCursor.toArray
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([{ id: 1 }, { id: 5 }])
  })

  test("array with partitioned errors", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const documentCollection = Db.documentCollection(db, "array-with-partitioned-errors")
      const collection = DocumentCollection.typed(documentCollection, User)

      yield* Collection.insertMany(collection, FastCheck.sample(UserArbitrary, 6))
      yield* DocumentCollection.insertOne(documentCollection, { id: 999, surname: "foo" })
      yield* Collection.insertMany(collection, FastCheck.sample(UserArbitrary, 3))

      return yield* Collection.find(collection).pipe(FindCursor.toArrayEither)
    })

    const result = await Effect.runPromise(program)

    expect(Array.getRights(result)).toHaveLength(9)
    expect(Array.getLefts(result)).toEqual(
      [
        [expect.objectContaining({ id: 999, surname: "foo" }), expect.any(ParseResult.ParseError)] as const
      ]
    )
  })

  test("stream", async () => {
    const anyUsers = FastCheck.sample(UserArbitrary, 6)

    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "stream", User)

      yield* Collection.insertMany(collection, anyUsers)

      return yield* Collection.find(collection).pipe(
        FindCursor.toStream,
        Stream.runCollect,
        Effect.map(Chunk.toReadonlyArray)
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(anyUsers)
  })

  test("stream with partitioned errors", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const documentCollection = Db.documentCollection(db, "stream-with-partitioned-errors")
      const collection = DocumentCollection.typed(documentCollection, User)

      yield* Collection.insertMany(collection, FastCheck.sample(UserArbitrary, 6))
      yield* DocumentCollection.insertOne(documentCollection, { id: 999, surname: "foo" })
      yield* Collection.insertMany(collection, FastCheck.sample(UserArbitrary, 3))

      return yield* Collection.find(collection).pipe(
        FindCursor.toStreamEither,
        Stream.runCollect,
        Effect.map(Chunk.toReadonlyArray)
      )
    })

    const result = await Effect.runPromise(program)

    expect(Array.getRights(result)).toHaveLength(9)
    expect(Array.getLefts(result)).toEqual(
      [
        [expect.objectContaining({ id: 999, surname: "foo" }), expect.any(ParseResult.ParseError)] as const
      ]
    )
  })
  test("run the same cursor multiple times and read fresh data", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "run-multiple-times", User)
      const cursor = Collection.find(collection).pipe(FindCursor.sort("id", "ascending"))

      yield* Collection.insertMany(collection, [{ id: 1, name: "a" }, { id: 2, name: "b" }])
      const firstArray = yield* FindCursor.toArray(cursor)
      const firstStream = yield* FindCursor.toStream(cursor).pipe(Stream.runCollect, Effect.map(Chunk.toReadonlyArray))

      yield* Collection.insertMany(collection, [{ id: 3, name: "c" }])
      const secondArray = yield* FindCursor.toArray(cursor)
      const secondStream = yield* FindCursor.toStream(cursor).pipe(Stream.runCollect, Effect.map(Chunk.toReadonlyArray))

      return { firstArray, firstStream, secondArray, secondStream }
    })

    const result = await Effect.runPromise(program)

    expect(result.firstArray).toEqual([{ id: 1, name: "a" }, { id: 2, name: "b" }])
    expect(result.firstStream).toEqual(result.firstArray)
    expect(result.secondArray).toEqual([{ id: 1, name: "a" }, { id: 2, name: "b" }, { id: 3, name: "c" }])
    expect(result.secondStream).toEqual(result.secondArray)
  })

  test("run the same stream multiple times", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "run-stream-multiple-times", User)
      yield* Collection.insertMany(collection, [{ id: 1, name: "a" }, { id: 2, name: "b" }])
      const stream = Collection.find(collection).pipe(FindCursor.sort("id", "ascending"), FindCursor.toStream)

      const first = yield* Stream.runCollect(stream)
      const second = yield* Stream.runCollect(stream)

      return { first: Chunk.toReadonlyArray(first), second: Chunk.toReadonlyArray(second) }
    })

    const result = await Effect.runPromise(program)

    expect(result.first).toEqual([{ id: 1, name: "a" }, { id: 2, name: "b" }])
    expect(result.second).toEqual(result.first)
  })

  test("derived cursors do not affect each other", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "derived-cursors", User)
      yield* Collection.insertMany(collection, [{ id: 1, name: "a" }, { id: 2, name: "b" }, { id: 3, name: "c" }])

      const all = Collection.find(collection).pipe(FindCursor.sort("id", "ascending"))
      const onlyFirst = all.pipe(FindCursor.limit(1))
      const onlyB = all.pipe(FindCursor.filter({ name: "b" }))
      const onlyFirstResult = yield* FindCursor.toArray(onlyFirst)
      const onlyBResult = yield* FindCursor.toArray(onlyB)
      const allResult = yield* FindCursor.toArray(all)
      const onlyFirstAgain = yield* all.pipe(FindCursor.limit(1), FindCursor.toArray)

      return { allResult, onlyFirstResult, onlyBResult, onlyFirstAgain }
    })

    const result = await Effect.runPromise(program)

    expect(result.allResult).toEqual([{ id: 1, name: "a" }, { id: 2, name: "b" }, { id: 3, name: "c" }])
    expect(result.onlyFirstResult).toEqual([{ id: 1, name: "a" }])
    expect(result.onlyBResult).toEqual([{ id: 2, name: "b" }])
    expect(result.onlyFirstAgain).toEqual([{ id: 1, name: "a" }])
  })
})

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
})
const UserArbitrary = Arbitrary.make(User)
