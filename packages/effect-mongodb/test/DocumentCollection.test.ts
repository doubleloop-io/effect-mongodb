import * as Db from "effect-mongodb/Db"
import * as DocumentCollection from "effect-mongodb/DocumentCollection"
import * as DocumentFindCursor from "effect-mongodb/DocumentFindCursor"
import * as Cause from "effect/Cause"
import * as Chunk from "effect/Chunk"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as O from "effect/Option"
import { ObjectId } from "mongodb"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("DocumentCollection", (ctx) => {
  test("insert and find", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = Db.documentCollection(db, "insert-and-find")

      yield* _(DocumentCollection.insertOne(collection, { name: "John" }))

      return yield* _(DocumentCollection.find(collection), DocumentFindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([{ _id: expect.any(ObjectId), name: "John" }])
  })

  test("insert an array as record", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = Db.documentCollection(db, "insert-an-array-as-record")

      yield* _(DocumentCollection.insertOne(collection, [{ name: "John" }]))
    })

    const result = await Effect.runPromiseExit(program)

    expect(Exit.isFailure(result)).toBeTruthy()
    if (Exit.isFailure(result)) {
      const error = Chunk.unsafeHead(Cause.failures(result.cause))
      expect(error.cause.errmsg).toEqual(
        "BSON field 'insert.documents.0' is the wrong type 'array', expected type 'object'"
      )
    }
  })

  test("insert a class instance as record", async () => {
    class MyClass {
      name: string

      constructor(name: string) {
        this.name = name
      }
    }

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = Db.documentCollection(db, "insert-a-class-instance-as-record")

      yield* _(DocumentCollection.insertOne(collection, new MyClass("John")))

      return yield* _(DocumentCollection.find(collection), DocumentFindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ _id: expect.any(ObjectId), name: "John" })
    expect(result[0]).not.toBeInstanceOf(MyClass)
  })

  test("insert many and find", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = Db.documentCollection(db, "insert-many-and-find")

      yield* _(
        DocumentCollection.insertMany(collection, [{ name: "NAME_1" }, { name: "NAME_2" }, { name: "NAME_3" }])
      )

      return yield* _(DocumentCollection.find(collection), DocumentFindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([
      { _id: expect.any(ObjectId), name: "NAME_1" },
      { _id: expect.any(ObjectId), name: "NAME_2" },
      { _id: expect.any(ObjectId), name: "NAME_3" }
    ])
  })

  test("find one", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = Db.documentCollection(db, "find-one")

      yield* _(
        DocumentCollection.insertMany(collection, [{ name: "ANY_NAME_1" }, { name: "john" }, { name: "ANY_NAME_2" }])
      )

      return yield* _(DocumentCollection.findOne(collection, { name: "john" }))
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.some({ _id: expect.any(ObjectId), name: "john" }))
  })

  test("find one - no result", async () => {
    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = Db.documentCollection(db, "find-one-no-result")

      yield* _(
        DocumentCollection.insertMany(collection, [{ name: "ANY_NAME_1" }, { name: "ANY_NAME_2" }, {
          name: "ANY_NAME_2"
        }])
      )

      return yield* _(DocumentCollection.findOne(collection, { name: "john" }))
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.none())
  })
})
