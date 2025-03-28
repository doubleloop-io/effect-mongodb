/**
 * @since 0.0.1
 */
import type * as Db from "effect-mongodb/Db"
import * as MongoClient from "effect-mongodb/MongoClient"
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type { DbOptions } from "mongodb"
import type * as MongoClientService from "./MongoClientService.js"

export type DbService<K extends string> = Db.Db & Brand.Brand<K>

export type Tag<K extends string> = Context.Tag<DbService<K>, DbService<K>>
export const Tag = <K extends string>(key: K): Tag<K> => Context.GenericTag<DbService<K>>(key)
export type Service<T extends Tag<any>> = Context.Tag.Service<T>

export const layerEffect = <DbK extends string, MongoClientK extends string, E = never, R = never>(
  dbTag: Tag<DbK>,
  clientTag: MongoClientService.Tag<MongoClientK>,
  dbName: Effect.Effect<string, E, R>,
  options?: DbOptions
): Layer.Layer<DbService<DbK>, E, MongoClientService.MongoClientService<MongoClientK> | R> =>
  Effect.gen(function*() {
    const dbname_ = yield* dbName
    return layer(dbTag, clientTag, dbname_, options)
  }).pipe(Layer.unwrapEffect)

export const layer = <DbK extends string, MongoClientK extends string>(
  dbTag: Tag<DbK>,
  clientTag: MongoClientService.Tag<MongoClientK>,
  dbName: string,
  options?: DbOptions
): Layer.Layer<DbService<DbK>, never, MongoClientService.MongoClientService<MongoClientK>> =>
  Layer.effect(
    dbTag,
    Effect.gen(function*() {
      const client = yield* clientTag
      const db = MongoClient.db(client, dbName, options)
      return dbTag.of(db as DbService<DbK>) // TODO fix cast using branded ctor
    })
  )
