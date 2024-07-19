import * as Collection from "@doubleloop-io/effect-mongodb/Collection"
import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as FindCursor from "@doubleloop-io/effect-mongodb/FindCursor"
import * as MongoClient from "@doubleloop-io/effect-mongodb/MongoClient"
import * as TypedFindCursor from "@doubleloop-io/effect-mongodb/TypedFindCursor"
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { expect, test } from "vitest"

test("find with projection", () => {
  const foo = MongoClient.connect("mongodb://localhost:27017").pipe(
    Effect.flatMap(MongoClient.db("foo")),
    Effect.flatMap(Db.collection("bar")),
    Effect.map(Collection.findV2),
    Effect.map((x) => FindCursor.typed(x, Schema.Struct({ foo: Schema.String }))),
    Effect.flatMap(TypedFindCursor.toArray)
  )
  expect(foo).toBeDefined()
})
