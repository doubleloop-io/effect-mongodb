import * as MongoClient from "effect-mongodb/MongoClient"
import * as MongoError from "effect-mongodb/MongoError"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import { describe, expect, inject, test } from "vitest"
import { assertInstanceOf } from "./support/assertions.js"

describe("MongoClient", () => {
  test("connect and close", async () => {
    await F.pipe(
      MongoClient.connect(inject("mongoConnectionString"), { directConnection: true }),
      Effect.tap((client) => Effect.sync(() => expect(client).toBeDefined())),
      Effect.flatMap(MongoClient.close),
      Effect.runPromise
    )
  })

  test("connect error", async () => {
    const result = await F.pipe(
      MongoClient.connect("mongodb://user:pwd@wrongurlforsure.local:27017", {
        directConnection: true,
        serverSelectionTimeoutMS: 200
      }),
      Effect.catchAll(Effect.succeed),
      Effect.runPromise
    )

    expect(result).toBeInstanceOf(MongoError.MongoError)
    if (result instanceof MongoError.MongoError) {
      expect(result.message).not.toContain("user")
      expect(result.message).not.toContain("pwd")
    }
  })

  test("connect error with multiple hosts in connection string", async () => {
    const result = await F.pipe(
      MongoClient.connect(
        "mongodb://user:pwd@db1.example.local:27017,db2.example.local:2500/?replicaSet=test&connectTimeoutMS=300000",
        {
          serverSelectionTimeoutMS: 200
        }
      ),
      Effect.catchAll(Effect.succeed),
      Effect.runPromise
    )

    assertInstanceOf(result, MongoError.MongoError)
    expect(result.message).not.toContain("user")
    expect(result.message).not.toContain("pwd")
    assertInstanceOf(result.source, MongoError.ClientErrorSource)
    expect(result.source.hosts).toEqual(["db1.example.local:27017", "db2.example.local:2500"])
  })
})
