import * as DbInstance from "@effect-mongodb/services/DbInstance"
import * as DbService from "@effect-mongodb/services/DbService"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Tracer from "effect/Tracer"
import { expect, inject, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"

describeMongo("DbInstance", (ctx) => {
  test("same layer provided multiple times builds a single client, closed at the end of the outer scope", async () => {
    const spans: Array<string> = []
    const tracer = Tracer.make({
      span: (options) => {
        spans.push(options.name)
        return new Tracer.NativeSpan(options)
      }
    })
    const connects = () => spans.filter((x) => x === "mongodb.MongoClient.connect").length
    const closes = () => spans.filter((x) => x === "mongodb.MongoClient.close").length

    const MyDb = DbService.Service("MyDb")
    const MyDbLive = DbInstance.layer(MyDb, {
      database: { name: ctx._database().databaseName },
      client: { url: inject("mongoConnectionString"), directConnection: true }
    })

    const program = Effect.gen(function*() {
      const outer = yield* MyDb
      const inner = yield* Effect.provide(MyDb, MyDbLive)
      return { outer, inner, closesBeforeOuterScopeEnd: closes() }
    })

    const result = await program.pipe(
      Effect.provide(MyDbLive.pipe(Layer.provideMerge(Layer.succeed(Tracer.Tracer, tracer)))),
      Effect.runPromise
    )

    expect(result.inner).toBe(result.outer)
    expect(result.closesBeforeOuterScopeEnd).toEqual(0)
    expect(connects()).toEqual(1)
    expect(closes()).toEqual(1)
  })
})
