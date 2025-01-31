/**
 * @since 0.0.1
 */
import type * as MongoClient from "effect-mongodb/MongoClient"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Layer from "effect/Layer"
import type { DbOptions } from "mongodb"
import * as DbService from "./DbService.js"
import * as MongoClientService from "./MongoClientService.js"

type DbInstanceOptions = {
  database: DbOptions & { name: string }
  client: MongoClient.MongoClientScopedOptions & { url: string }
}

export const layerEffect = <DbK extends string, E = never, R = never>(
  dbTag: DbService.TagType<DbK>,
  options: Effect.Effect<DbInstanceOptions, E, R>
) =>
  F.pipe(
    options,
    Effect.map((options) => layer(dbTag, options)),
    Layer.unwrapEffect
  )

export const layer = <DbK extends string>(
  dbTag: DbService.TagType<DbK>,
  options: DbInstanceOptions
) => {
  const { name: databaseName, ...databaseOptions } = options.database
  const { url: clientUrl, ...clientOptions } = options.client

  const dbLayer = DbService.layer(dbTag, DefaultMongoClient, databaseName, databaseOptions)
  const defaultClientLayer = MongoClientService.layer(DefaultMongoClient, clientUrl, clientOptions)
  return dbLayer.pipe(Layer.provide(defaultClientLayer))
}

const DefaultMongoClient = MongoClientService.Tag("@effect-mongodb/services/DefaultMongoClient")
