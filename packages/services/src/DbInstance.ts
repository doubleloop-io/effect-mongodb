/**
 * @since 0.0.1
 */
import * as MongoClient from "effect-mongodb/MongoClient"
import type * as MongoError from "effect-mongodb/MongoError"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Layer from "effect/Layer"
import type { DbOptions, MongoClient as MongoClient_ } from "mongodb"
import * as DbService from "./DbService.js"
import * as MongoClientService from "./MongoClientService.js"

type DbInstanceOptions = {
  database: DbOptions & { name: string }
  client: MongoClient.MongoClientScopedOptions & { url: string }
}

export const layerEffect = <DbK extends string, E = never, R = never>(
  dbService: DbService.Service<DbK>,
  options: Effect.Effect<DbInstanceOptions, E, R>
): Layer.Layer<DbService.DbService<DbK>, MongoError.MongoError | E, R> =>
  F.pipe(
    options,
    Effect.map((options) => layer(dbService, options)),
    Layer.unwrap
  )

export const layer = <DbK extends string>(
  dbService: DbService.Service<DbK>,
  options: DbInstanceOptions
): Layer.Layer<DbService.DbService<DbK>, MongoError.MongoError> => {
  const { name: databaseName, ...databaseOptions } = options.database
  const { url: clientUrl, ...clientOptions } = options.client

  const dbLayer = DbService.layer(dbService, DefaultMongoClient, databaseName, databaseOptions)
  const defaultClientLayer = MongoClientService.layer(DefaultMongoClient, clientUrl, clientOptions)
  return dbLayer.pipe(Layer.provide(defaultClientLayer))
}

type DbInstanceOptionsWithClient = Pick<DbInstanceOptions, "database"> & { client: MongoClient_ }

export const fromMongoClient = <DbK extends string, E = never, R = never>(
  dbService: DbService.Service<DbK>,
  options: Effect.Effect<DbInstanceOptionsWithClient, E, R>
): Layer.Layer<DbService.DbService<DbK>, E, R> =>
  Layer.effect(
    dbService,
    Effect.gen(function*() {
      const { client: client_, database: { name, ...dbOptions } } = yield* options
      const client = new MongoClient.MongoClient({ client: client_ })
      const db = MongoClient.db(client, name, dbOptions)
      return dbService.of(db as DbService.DbService<DbK>)
    })
  )

const DefaultMongoClient = MongoClientService.Service("@effect-mongodb/services/DefaultMongoClient")
