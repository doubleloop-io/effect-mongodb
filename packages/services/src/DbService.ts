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

export type Service<K extends string> = Context.Service<DbService<K>, DbService<K>>
export const Service = <K extends string>(key: K): Service<K> => Context.Service<DbService<K>>(key)
export type Shape<T extends Service<any>> = Context.Service.Shape<T>

export const layerEffect = <DbK extends string, MongoClientK extends string, E = never, R = never>(
  dbService: Service<DbK>,
  clientService: MongoClientService.Service<MongoClientK>,
  dbName: Effect.Effect<string, E, R>,
  options?: DbOptions
): Layer.Layer<DbService<DbK>, E, MongoClientService.MongoClientService<MongoClientK> | R> =>
  Effect.gen(function*() {
    const dbname_ = yield* dbName
    return layer(dbService, clientService, dbname_, options)
  }).pipe(Layer.unwrap)

export const layer = <DbK extends string, MongoClientK extends string>(
  dbService: Service<DbK>,
  clientService: MongoClientService.Service<MongoClientK>,
  dbName: string,
  options?: DbOptions
): Layer.Layer<DbService<DbK>, never, MongoClientService.MongoClientService<MongoClientK>> =>
  Layer.effect(
    dbService,
    Effect.gen(function*() {
      const client = yield* clientService
      const db = MongoClient.db(client, dbName, options)
      return dbService.of(db as DbService<DbK>) // TODO fix cast using branded ctor
    })
  )
