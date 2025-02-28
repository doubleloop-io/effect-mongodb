/**
 * @since 0.1.0
 */
import * as MongoClient from "effect-mongodb/MongoClient"
import type * as MongoError from "effect-mongodb/MongoError"
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export type MongoClientService<K extends string> = MongoClient.MongoClient & Brand.Brand<K>

export type Tag<K extends string> = Context.Tag<MongoClientService<K>, MongoClientService<K>>
export const Tag = <K extends string>(key: K): Tag<K> => Context.GenericTag<MongoClientService<K>>(key)

export const layerEffect = <MongoClientK extends string, E = never, R = never>(
  clientTag: Tag<MongoClientK>,
  url: Effect.Effect<string, E, R>,
  options?: MongoClient.MongoClientScopedOptions
): Layer.Layer<MongoClientService<MongoClientK>, MongoError.MongoError | E, R> =>
  Effect.gen(function*() {
    const url_ = yield* url
    return layer(clientTag, url_, options)
  }).pipe(Layer.unwrapEffect)

export const layer = <MongoClientK extends string>(
  clientTag: Tag<MongoClientK>,
  url: string,
  options?: MongoClient.MongoClientScopedOptions
): Layer.Layer<MongoClientService<MongoClientK>, MongoError.MongoError> =>
  Layer.scopedContext(Effect.gen(function*() {
    const client = yield* MongoClient.connectScoped(url, options)
    return Context.make(clientTag, client as MongoClientService<MongoClientK>)
  }))

export const fromMongoClient = <MongoClientK extends string, E = never, R = never>(
  clientTag: Tag<MongoClientK>,
  mongoClient: Effect.Effect<MongoClient.MongoClient, E, R>
): Layer.Layer<MongoClientService<MongoClientK>, E, R> =>
  Layer.effect(
    clientTag,
    Effect.map(mongoClient, (client) => client as MongoClientService<MongoClientK>)
  )
