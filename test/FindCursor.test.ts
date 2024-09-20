import * as Collection from "@doubleloop-io/effect-mongodb/Collection"
import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as DocumentCollection from "@doubleloop-io/effect-mongodb/DocumentCollection"
import * as FindCursor from "@doubleloop-io/effect-mongodb/FindCursor"
import * as Arbitrary from "@effect/schema/Arbitrary"
import * as FastCheck from "@effect/schema/FastCheck"
import * as Schema from "@effect/schema/Schema"
import * as Chunk from "effect/Chunk"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("FindCursor", (ctx) => {
  test("decode documents with schema", async () => {
    const anyTestEntities = FastCheck.sample(UserArbitrary, 3)

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(
        Db.collection(db, "decode-documents-with-schema"),
        Effect.map(DocumentCollection.typed(User))
      )

      yield* _(Collection.insertMany(collection, anyTestEntities))

      return yield* _(Collection.find(collection), FindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(anyTestEntities)
  })

  test("project", async () => {
    const anyUsers = FastCheck.sample(UserArbitrary, 3)

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection(db, "project"), Effect.map(DocumentCollection.typed(User)))

      yield* _(Collection.insertMany(collection, anyUsers))

      return yield* _(
        Collection.find(collection),
        FindCursor.project(UserStats, { id: 1, nameLength: { $strLenCP: "$name" } }),
        FindCursor.toArray
      )
    })

    const result = await Effect.runPromise(program)

    const users = anyUsers.map((x) => UserStats.make({ id: x.id, nameLength: x.name.length }))
    expect(result).toEqual(users)
  })

  test("stream", async () => {
    const anyUsers = FastCheck.sample(UserArbitrary, 6)

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection(db, "stream"), Effect.map(DocumentCollection.typed(User)))

      yield* _(Collection.insertMany(collection, anyUsers))

      return yield* _(
        Collection.find(collection),
        FindCursor.toStream,
        Stream.runCollect,
        Effect.map(Chunk.toReadonlyArray)
      )
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(anyUsers)
  })
})

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
})
const UserArbitrary = Arbitrary.make(User)

const UserStats = Schema.Struct({
  id: User.fields.id,
  nameLength: Schema.Number
})
