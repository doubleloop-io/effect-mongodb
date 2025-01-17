/**
 * @since 0.0.1
 */
import * as MongoClient from "effect-mongodb/MongoClient"
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export type MongoClientService<K extends string> = MongoClient.MongoClient & Brand.Brand<K>

export const Tag = <K extends string>(key: K) => Context.GenericTag<MongoClientService<K>>(key)
export type TagType<K extends string> = ReturnType<typeof Tag<K>>

export const layerEffect = <MongoClientK extends string, E = never, R = never>(
  clientTag: TagType<MongoClientK>,
  url: Effect.Effect<string, E, R>
) =>
  Effect.gen(function*() {
    const url_ = yield* url
    return layer(clientTag, url_)
  }).pipe(Layer.unwrapEffect)

export const layer = <MongoClientK extends string>(
  clientTag: TagType<MongoClientK>,
  url: string
) =>
  Layer.scopedContext(Effect.gen(function*() {
    const client = yield* MongoClient.connectScoped(url)
    return Context.make(clientTag, client as MongoClientService<MongoClientK>)
  }))
