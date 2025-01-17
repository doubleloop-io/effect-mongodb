/**
 * @since 0.0.1
 */
import type * as MongoClient from "effect-mongodb/MongoClient"
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"

export type MongoClientService<K extends string> = MongoClient.MongoClient & Brand.Brand<K>

export const Tag = <K extends string>(key: K) => Context.GenericTag<MongoClientService<K>>(key)
export type TagType<K extends string> = ReturnType<typeof Tag<K>>
