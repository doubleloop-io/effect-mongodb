/**
 * @since 0.0.1
 */
import * as MongoClient from "effect-mongodb/MongoClient"
import type * as MongoError from "effect-mongodb/MongoError"
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type { Db } from "mongodb"
import type * as MongoClientService from "./MongoClient.js"

export type DbService<K extends string> = {
  db: Effect.Effect<Db, MongoError.MongoError>
} & Brand.Brand<K>

export const Tag = <K extends string>(key: K) => Context.GenericTag<DbService<K>>(key)
export type TagType<K extends string> = ReturnType<typeof Tag<K>>

export const fromEffect = <DbK extends string, MongoClientK extends string, E = never, R = never>(
  dbTag: TagType<DbK>,
  clientTag: MongoClientService.TagType<MongoClientK>,
  dbName: Effect.Effect<string, E, R>
) =>
  Layer.effect(
    dbTag,
    Effect.gen(function*() {
      const { client } = yield* clientTag
      const dbName_ = yield* dbName
      const db = yield* client.pipe(Effect.map((client) => MongoClient.db(client, dbName_)), Effect.cached)
      return dbTag.of({ db } as DbService<DbK>) // TODO fix cast using branded ctor
    })
  )

export const fromConst = <DbK extends string, MongoClientK extends string>(
  dbTag: TagType<DbK>,
  clientTag: MongoClientService.TagType<MongoClientK>,
  dbName: string
) => fromEffect(dbTag, clientTag, Effect.succeed(dbName))
