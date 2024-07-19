import * as Collection from "@doubleloop-io/effect-mongodb/Collection"
import * as Db from "@doubleloop-io/effect-mongodb/Db"
import * as FindCursor from "@doubleloop-io/effect-mongodb/FindCursor"
import * as TypedFindCursor from "@doubleloop-io/effect-mongodb/TypedFindCursor"
import * as Arbitrary from "@effect/schema/Arbitrary"
import * as FastCheck from "@effect/schema/FastCheck"
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { expect, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("TypedFindCursor", (ctx) => {
  test("decode documents with schema", async () => {
    const anyTestEntities = FastCheck.sample(TestEntityArbitrary, 3)

    const program = Effect.gen(function*(_) {
      const db = yield* _(ctx.database)
      const collection = yield* _(Db.collection<TestEntityEncoded>(db, "decode-documents-with-schema"))

      yield* _(
        Collection.insertMany(collection, anyTestEntities.map((x) => encodeTestEntity(x)))
      )

      // TODO: make FindCursor.typed dual
      return yield* _(Collection.findV2(collection), (x) => FindCursor.typed(x, TestEntity), TypedFindCursor.toArray)
    })

    const result = await Effect.runPromise(program)

    expect(result).toEqual(anyTestEntities)
  })
})

const TestEntity = Schema.Struct({
  id: Schema.Number,
  name: Schema.String
})
type TestEntityEncoded = typeof TestEntity.Encoded
const TestEntityArbitrary = Arbitrary.make(TestEntity)
const encodeTestEntity = Schema.encodeSync(TestEntity)
