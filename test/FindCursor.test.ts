import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as DocumentCollection from "@doubleloop-io/effect-mongodb/DocumentCollection"
import * as DocumentFindCursor from "@doubleloop-io/effect-mongodb/DocumentFindCursor"
import * as FindCursor from "@doubleloop-io/effect-mongodb/FindCursor"
import * as Arbitrary from "@effect/schema/Arbitrary"
import * as FastCheck from "@effect/schema/FastCheck"
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("FindCursor", (ctx) => {
  test("decode documents with schema", async () => {
    const anyTestEntities = FastCheck.sample(UserArbitrary, 3)

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection(db, "decode-documents-with-schema"))

      yield* _(
        DocumentCollection.insertMany(collection, anyTestEntities.map((x) => encodeUser(x)))
      )

      return yield* _(DocumentCollection.find(collection), DocumentFindCursor.typed(User), FindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(anyTestEntities)
  })

  test("project", async () => {
    const anyUsers = FastCheck.sample(UserArbitrary, 3)

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection(db, "project"))

      yield* _(
        DocumentCollection.insertMany(collection, anyUsers.map((x) => encodeUser(x)))
      )

      return yield* _(
        DocumentCollection.find(collection),
        DocumentFindCursor.typed(User),
        FindCursor.project(UserStats, { id: 1, nameLength: { $strLenCP: "$name" } }),
        FindCursor.toArray
      )
    })

    const result = await Effect.runPromise(program)

    const users = anyUsers.map((x) => UserStats.make({ id: x.id, nameLength: x.name.length }))
    expect(result).toEqual(users)
  })
})

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
})
const UserArbitrary = Arbitrary.make(User)
const encodeUser = Schema.encodeSync(User)

const UserStats = Schema.Struct({
  id: User.fields.id,
  nameLength: Schema.Number
})
