import * as Collection from "effect-mongodb/Collection"
import * as Db from "effect-mongodb/Db"
import * as FindCursor from "effect-mongodb/FindCursor"
import * as MongoClient from "effect-mongodb/MongoClient"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import { expect, inject, test } from "vitest"
import { describeMongo } from "./support/describe-mongo.js"
import { attributesOf, spanByName, spanCollector } from "./support/tracing.js"

describeMongo("Tracing", (ctx) => {
  test("collection operation", async () => {
    const collector = spanCollector()

    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "tracing-find-one", User)

      yield* Collection.insertOne(collection, User.make({ name: "john", birthday: new Date(1977, 11, 27) }))

      return yield* Collection.findOne(collection, { name: "john" })
    })

    await Effect.runPromise(Effect.provide(program, collector.layer))

    const span = spanByName(collector, "mongodb.Collection.findOne")
    expect(span.kind).toEqual("client")
    expect(attributesOf(span)).toEqual({
      "db.system.name": "mongodb",
      "db.operation.name": "findOne",
      "db.namespace": "Tracing",
      "db.collection.name": "tracing-find-one"
    })
    expect(attributesOf(spanByName(collector, "mongodb.Collection.insertOne"))).toMatchObject({
      "db.operation.name": "insertOne",
      "db.collection.name": "tracing-find-one"
    })
  })

  test("cursor operation", async () => {
    const collector = spanCollector()

    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "tracing-cursor", User)

      yield* Collection.insertOne(collection, User.make({ name: "john", birthday: new Date(1977, 11, 27) }))

      return yield* F.pipe(collection, Collection.find(), FindCursor.toArray)
    })

    await Effect.runPromise(Effect.provide(program, collector.layer))

    const span = spanByName(collector, "mongodb.FindCursor.toArray")
    expect(span.kind).toEqual("client")
    expect(attributesOf(span)).toEqual({
      "db.system.name": "mongodb",
      "db.operation.name": "toArray",
      "db.namespace": "Tracing",
      "db.collection.name": "tracing-cursor"
    })
  })

  test("stream operation", async () => {
    const collector = spanCollector()

    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "tracing-stream", User)

      yield* Collection.insertOne(collection, User.make({ name: "john", birthday: new Date(1977, 11, 27) }))

      return yield* F.pipe(collection, Collection.find(), FindCursor.toStream, Stream.runCollect)
    })

    await Effect.runPromise(Effect.provide(program, collector.layer))

    expect(attributesOf(spanByName(collector, "mongodb.FindCursor.toStream"))).toEqual({
      "db.system.name": "mongodb",
      "db.operation.name": "toStream",
      "db.namespace": "Tracing",
      "db.collection.name": "tracing-stream"
    })
  })

  test("database operation", async () => {
    const collector = spanCollector()

    const program = Effect.gen(function*() {
      const db = yield* ctx.database
      const collection = Db.collection(db, "tracing-drop", User)

      yield* Collection.insertOne(collection, User.make({ name: "john", birthday: new Date(1977, 11, 27) }))

      return yield* Db.dropCollection(db, "tracing-drop")
    })

    await Effect.runPromise(Effect.provide(program, collector.layer))

    expect(attributesOf(spanByName(collector, "mongodb.Db.dropCollection"))).toEqual({
      "db.system.name": "mongodb",
      "db.operation.name": "dropCollection",
      "db.namespace": "Tracing"
    })
  })

  test("client operation", async () => {
    const collector = spanCollector()

    const program = F.pipe(
      MongoClient.connect(inject("mongoConnectionString"), { directConnection: true }),
      Effect.flatMap(MongoClient.close)
    )

    await Effect.runPromise(Effect.provide(program, collector.layer))

    const span = spanByName(collector, "mongodb.MongoClient.connect")
    expect(span.kind).toEqual("client")
    expect(attributesOf(span)).toMatchObject({
      "db.system.name": "mongodb",
      "db.operation.name": "connect",
      "server.address": expect.any(String),
      "server.port": expect.any(Number)
    })
  })

  test("failed operation", async () => {
    const collector = spanCollector()

    const program = F.pipe(
      MongoClient.connect("mongodb://wrongurlforsure.local:27017", {
        directConnection: true,
        serverSelectionTimeoutMS: 200
      }),
      Effect.catchAll(Effect.succeed)
    )

    await Effect.runPromise(Effect.provide(program, collector.layer))

    const span = spanByName(collector, "mongodb.MongoClient.connect")
    expect(span.status._tag).toEqual("Ended")
    expect(span.status._tag === "Ended" && Exit.isFailure(span.status.exit)).toBe(true)
    expect(attributesOf(span)).toEqual({
      "db.system.name": "mongodb",
      "db.operation.name": "connect",
      "server.address": "wrongurlforsure.local",
      "server.port": 27017
    })
  })
})

const User = Schema.Struct({
  name: Schema.String,
  birthday: Schema.Date
})
