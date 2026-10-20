/**
 * @since 0.0.1
 */
import * as MongoClient from "effect-mongodb/MongoClient"
import type * as MongoError from "effect-mongodb/MongoError"
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export type MongoClientService<K extends string> = MongoClient.MongoClient & Brand.Brand<K>

export type Service<K extends string> = Context.Service<MongoClientService<K>, MongoClientService<K>>
export const Service = <K extends string>(key: K): Service<K> => Context.Service<MongoClientService<K>>(key)
export type Shape<T extends Service<any>> = Context.Service.Shape<T>

export const layerEffect = <MongoClientK extends string, E = never, R = never>(
  clientService: Service<MongoClientK>,
  url: Effect.Effect<string, E, R>,
  options?: MongoClient.MongoClientScopedOptions
): Layer.Layer<MongoClientService<MongoClientK>, MongoError.MongoError | E, R> =>
  Effect.gen(function*() {
    const url_ = yield* url
    return layer(clientService, url_, options)
  }).pipe(Layer.unwrap)

export const layer = <MongoClientK extends string>(
  clientService: Service<MongoClientK>,
  url: string,
  options?: MongoClient.MongoClientScopedOptions
): Layer.Layer<MongoClientService<MongoClientK>, MongoError.MongoError> =>
  Layer.effect(
    clientService,
    Effect.map(MongoClient.connectScoped(url, options), (client) => client as MongoClientService<MongoClientK>)
  )

export const fromMongoClient = <MongoClientK extends string, E = never, R = never>(
  clientService: Service<MongoClientK>,
  mongoClient: Effect.Effect<MongoClient.MongoClient, E, R>
): Layer.Layer<MongoClientService<MongoClientK>, E, R> =>
  Layer.effect(
    clientService,
    Effect.map(mongoClient, (client) => client as MongoClientService<MongoClientK>)
  )
