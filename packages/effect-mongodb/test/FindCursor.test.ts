import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as Array from "effect/Array"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as SchemaError from "effect/SchemaError"
import * as Stream from "effect/Stream"
import * as FastCheck from "effect/testing/FastCheck"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("FindCursor", (ctx) => {
  test("acceptance test", async () => {
    const beforeJuly = "2024-07-01T00:00:00.000Z"

    const User = Schema.Struct({
      id: Schema.Number,
      createdOn: Schema.DateFromString
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

    expect(Array.getSuccesses(result)).toHaveLength(9)
    expect(Array.getFailures(result)).toEqual(
      [
        [expect.objectContaining({ id: 999, surname: "foo" }), expect.any(SchemaError.SchemaError)] as const
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
        Stream.runCollect
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
        Stream.runCollect
      )
    })

    const result = await Effect.runPromise(program)

    expect(Array.getSuccesses(result)).toHaveLength(9)
    expect(Array.getFailures(result)).toEqual(
      [
        [expect.objectContaining({ id: 999, surname: "foo" }), expect.any(SchemaError.SchemaError)] as const
      ]
    )
  })
})

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
})
const UserArbitrary = Schema.toArbitrary(User)
