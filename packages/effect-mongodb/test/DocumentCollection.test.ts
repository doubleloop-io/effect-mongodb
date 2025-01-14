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
  test("insert an array as record", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.documentCollection(db, "insert-an-array-as-record")

      yield* DocumentCollection.insertOne(collection, [{ name: "John" }])
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

    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.documentCollection(db, "insert-a-class-instance-as-record")

      yield* DocumentCollection.insertOne(collection, new MyClass("John"))

      return yield* DocumentCollection.find(collection).pipe(DocumentFindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ _id: expect.any(ObjectId), name: "John" })
    expect(result[0]).not.toBeInstanceOf(MyClass)
  })

  test("find one", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.documentCollection(db, "find-one")

      yield* DocumentCollection.insertMany(
        collection,
        [{ name: "ANY_NAME_1" }, { name: "john" }, { name: "ANY_NAME_2" }]
      )

      return yield* DocumentCollection.findOne(collection, { name: "john" })
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.some({ _id: expect.any(ObjectId), name: "john" }))
  })

  test("find one - no result", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.documentCollection(db, "find-one-no-result")

      yield* DocumentCollection.insertMany(
        collection,
        [{ name: "ANY_NAME_1" }, { name: "ANY_NAME_2" }, { name: "ANY_NAME_3" }]
      )

      return yield* DocumentCollection.findOne(collection, { name: "john" })
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.none())
  })

  test("find one and replace", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.documentCollection(db, "find-one-and-replace")

      yield* DocumentCollection.insertOne(collection, { name: "john", version: "v1" })

      return yield* DocumentCollection.findOneAndReplace(
        collection,
        { name: "john", version: "v1" },
        { name: "john", version: "v2" },
        { returnDocument: "after" }
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.some({ _id: expect.any(ObjectId), name: "john", version: "v2" }))
  })

  test("find one and replace - include result metadata", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.documentCollection(db, "find-one-and-replace-include-result-metadata")

      yield* DocumentCollection.insertOne(collection, { name: "john", version: "v1" })

      return yield* DocumentCollection.findOneAndReplace(
        collection,
        { name: "john", version: "v1" },
        { name: "john", version: "v2" },
        { returnDocument: "after", includeResultMetadata: true }
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toMatchObject({
      ok: 1,
      value: O.some({ _id: expect.any(ObjectId), name: "john", version: "v2" })
    })
  })
})
