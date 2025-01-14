import * as AggregationCursor from "effect-mongodb/AggregationCursor"
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as Effect from "effect/Effect"
import * as O from "effect/Option"
import * as Schema from "effect/Schema"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("Collection", (ctx) => {
  test("find one", async () => {
    const user = User.make({ name: "john", birthday: new Date(1977, 11, 27) })

    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "find-one", User)

      yield* Collection.insertOne(collection, user)

      return yield* Collection.findOne(collection, { name: "john" });
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.some(user))
  })

  test("find one - no result", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "find-one-no-result", User)

      const users = [
        User.make({ name: "any1", birthday: new Date(1994, 1, 1) }),
        User.make({ name: "any2", birthday: new Date(1977, 11, 27) }),
        User.make({ name: "any3", birthday: new Date(1989, 5, 11) })
      ]
      yield* Collection.insertMany(collection, users)

      return yield* Collection.findOne(collection, { name: "john" });
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.none())
  })

  test("find one and replace", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "find-one-and-replace", UserWithVersion)

      yield* Collection.insertOne(collection, { name: "john", version: "v1" })

      return yield* Collection.findOneAndReplace(
        collection,
        { name: "john", version: "v1" },
        { name: "john", version: "v2" },
        { returnDocument: "after" }
      );
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.some({ name: "john", version: "v2" }))
  })

  test("find one and replace - include result metadata", async () => {
    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "find-one-and-replace-include-result-metadata", UserWithVersion)

      yield* Collection.insertOne(collection, { name: "john", version: "v1" })

      return yield* Collection.findOneAndReplace(
        collection,
        { name: "john", version: "v1" },
        { name: "john", version: "v2" },
        { returnDocument: "after", includeResultMetadata: true }
      );
    })

    const result = await Effect.runPromise(program)

    expect(result).toMatchObject({
      ok: 1,
      value: O.some({ name: "john", version: "v2" })
    })
  })

  test("aggregate", async () => {
    const user1 = User.make({ name: "user1", birthday: new Date(1977, 11, 27) })
    const user2 = User.make({ name: "user2", birthday: new Date(1977, 11, 27) })
    const user3 = User.make({ name: "user3", birthday: new Date(1985, 6, 16) })
    const user4 = User.make({ name: "user4", birthday: new Date(1989, 11, 28) })
    const user5 = User.make({ name: "user5", birthday: new Date(1995, 3, 21) })
    const user6 = User.make({ name: "user6", birthday: new Date(2000, 5, 30) })

    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "aggregate", User)

      yield* Collection.insertMany(collection, [user1, user2, user3, user4, user5, user6])

      const _1990 = "1990-01-01T00:00:00.000Z"
      return yield* Collection.aggregate(collection, UserAggregation, [
        {
          $match: {
            birthday: { $lt: _1990 }
          }
        },
        {
          $group: {
            _id: "$birthday",
            names: { $addToSet: "$name" }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]).pipe(AggregationCursor.toArray);
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual([
      {
        _id: new Date(1977, 11, 27),
        names: expect.arrayContaining(["user1", "user2"])
      },
      {
        _id: new Date(1985, 6, 16),
        names: ["user3"]
      },
      {
        _id: new Date(1989, 11, 28),
        names: ["user4"]
      }
    ])
  })
})

const User = Schema.Struct({
  name: Schema.String,
  birthday: Schema.Date
})

const UserWithVersion = Schema.Struct({
  name: Schema.String,
  version: Schema.String
})

const UserAggregation = Schema.Struct({
  _id: Schema.Date,
  names: Schema.Array(Schema.String)
})
