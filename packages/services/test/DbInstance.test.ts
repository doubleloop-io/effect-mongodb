import * as DbInstance from "@effect-mongodb/services/DbInstance"
import * as DbService from "@effect-mongodb/services/DbService"
import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as Effect from "effect/Effect"
import * as O from "effect/Option"
import * as Schema from "effect/Schema"
import { expect, inject, test } from "vitest"

test("db instance layer provides a connected Db", async () => {
  const program = Effect.gen(function*() {
    const db = yield* MyDb
    const collection = Db.collection(db, "users", User)

    yield* Collection.insertOne(collection, User.make({ name: "john" }))

    return yield* Collection.findOne(collection, { name: "john" })
  })

  const layer = DbInstance.layer(MyDb, {
    database: { name: "db-instance" },
    client: { url: inject("mongoConnectionString"), directConnection: true }
  })

  const result = await Effect.runPromise(Effect.provide(program, layer))

  expect(result).toEqual(O.some({ name: "john" }))
})

const MyDb = DbService.Tag("@effect-mongodb/services/test/MyDb")

const User = Schema.Struct({
  name: Schema.String
})
