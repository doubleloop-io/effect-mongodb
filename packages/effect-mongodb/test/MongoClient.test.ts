import * as MongoClient from "effect-mongodb/MongoClient"
import * as MongoError from "effect-mongodb/MongoError"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import { describe, expect, inject, test } from "vitest"

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

  test("parse hosts from connection string", async () => {
    const getErrorMessage = async (url: string) =>
      F.pipe(
        MongoClient.connect(url, {
          directConnection: true,
          serverSelectionTimeoutMS: 200
        }),
        Effect.catchAll(Effect.succeed),
        Effect.runPromise
      )

    const singleHostMsg = await getErrorMessage("mongodb://localhost:27017")
    expect(singleHostMsg).toBeInstanceOf(MongoError.MongoError)
    if (singleHostMsg instanceof MongoError.MongoError) {
      expect(singleHostMsg.message).toContain("localhost:27017")
    }
    const multiHostMsg = await getErrorMessage("mongodb://host1:27017,host2:27017,host3:27017")
    expect(multiHostMsg).toBeInstanceOf(MongoError.MongoError)
    if (multiHostMsg instanceof MongoError.MongoError) {
      expect(multiHostMsg.message).toContain("host1:27017")
      expect(multiHostMsg.message).toContain("host2:27017")
      expect(multiHostMsg.message).toContain("host3:27017")
    }
    const srvMsg = await getErrorMessage("mongodb+srv://cluster.example.com")
    expect(srvMsg).toBeInstanceOf(MongoError.MongoError)
    if (srvMsg instanceof MongoError.MongoError) {
      expect(srvMsg.message).toContain("cluster.example.com")
    }
    const withAuthMsg = await getErrorMessage("mongodb://user:pass@host1:27017,host2:27017/db?replicaSet=rs0")
    expect(withAuthMsg).toBeInstanceOf(MongoError.MongoError)
    if (withAuthMsg instanceof MongoError.MongoError) {
      expect(withAuthMsg.message).not.toContain("user")
      expect(withAuthMsg.message).not.toContain("pass")
      expect(withAuthMsg.message).toContain("host1:27017")
      expect(withAuthMsg.message).toContain("host2:27017")
    }
  })

  test("parse invalid hosts from connection string", async () => {
    const result = await F.pipe(
      MongoClient.connect("mongodb//localhost:27017", {
        directConnection: true,
        serverSelectionTimeoutMS: 200
      }),
      Effect.catchAllDefect(Effect.succeed),
      Effect.runPromise
    )

    // const singleHostMsg = await getErrorMessage("mongodb://localhost:27017")
    expect(result).toBeInstanceOf(Error)
    if (result instanceof Error) {
      expect(result.message).toContain("hosts Invalid scheme")
    }
  })
})
