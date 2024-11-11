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
    const user = { name: "john", birthday: new Date(1977, 11, 27) }

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = Db.collection(db, "find-one", User)

      yield* _(
        Collection.insertOne(collection, user)
      )

      return yield* _(Collection.findOne(collection, { name: "john" }))
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(O.some(user))
  })

  test("aggregate", async () => {
    const user1 = User.make({ name: "user1", birthday: new Date(1977, 11, 27) })
    const user2 = User.make({ name: "user2", birthday: new Date(1977, 11, 27) })
    const user3 = User.make({ name: "user3", birthday: new Date(1985, 6, 16) })
    const user4 = User.make({ name: "user4", birthday: new Date(1989, 11, 28) })
    const user5 = User.make({ name: "user5", birthday: new Date(1995, 3, 21) })
    const user6 = User.make({ name: "user6", birthday: new Date(2000, 5, 30) })

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = Db.collection(db, "aggregate", User)

      yield* _(
        Collection.insertMany(collection, [user1, user2, user3, user4, user5, user6])
      )

      const _1990 = "1990-01-01T00:00:00.000Z"
      return yield* _(
        Collection.aggregate(collection, [
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
        ], UserAggregation),
        AggregationCursor.toArray
      )
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

const UserAggregation = Schema.Struct({
  _id: Schema.Date,
  names: Schema.Array(Schema.String)
})
