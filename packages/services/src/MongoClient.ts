/**
 * @since 0.0.1
 */
import type * as MongoClient from "effect-mongodb/MongoClient"
import type * as MongoError from "effect-mongodb/MongoError"
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import type * as Effect from "effect/Effect"

export type MongoClientService<K extends string> = {
  client: Effect.Effect<MongoClient.MongoClient, MongoError.MongoError>
} & Brand.Brand<K>

export const Tag = <K extends string>(key: K) => Context.GenericTag<MongoClientService<K>>(key)
export type TagType<K extends string> = ReturnType<typeof Tag<K>>
