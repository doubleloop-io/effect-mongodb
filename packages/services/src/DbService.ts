/**
 * @since 0.0.1
 */
import * as MongoClient from "effect-mongodb/MongoClient"
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type { Db } from "mongodb"
import type * as MongoClientService from "./MongoClientService.js"

export type DbService<K extends string> = Db & Brand.Brand<K>

export const Tag = <K extends string>(key: K) => Context.GenericTag<DbService<K>>(key)
export type TagType<K extends string> = ReturnType<typeof Tag<K>>

export const layerEffect = <DbK extends string, MongoClientK extends string, E = never, R = never>(
  dbTag: TagType<DbK>,
  clientTag: MongoClientService.TagType<MongoClientK>,
  dbName: Effect.Effect<string, E, R>
) =>
  Effect.gen(function*() {
    const dbname_ = yield* dbName
    return layer(dbTag, clientTag, dbname_)
  }).pipe(Layer.unwrapEffect)

export const layer = <DbK extends string, MongoClientK extends string>(
  dbTag: TagType<DbK>,
  clientTag: MongoClientService.TagType<MongoClientK>,
  dbName: string
) =>
  Layer.effect(
    dbTag,
    Effect.gen(function*() {
      const client = yield* clientTag
      const db = MongoClient.db(client, dbName)
      return dbTag.of(db as DbService<DbK>) // TODO fix cast using branded ctor
    })
  )
