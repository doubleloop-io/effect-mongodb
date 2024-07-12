import * as Collection from "@doubleloop-io/effect-mongodb/Collection"
import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as MongoClient from "@doubleloop-io/effect-mongodb/MongoClient"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import { expect, test } from "vitest"

test("should work", () => {
  const foo = MongoClient.connect("mongodb://localhost:27017").pipe(
    Effect.flatMap(MongoClient.db("foo")),
    Effect.flatMap(Db.collection("bar")),
    Effect.flatMap(F.flow(Collection.find(), Collection.toArray))
  )
  expect(foo).toBeDefined()
})
