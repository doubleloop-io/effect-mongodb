/**
 * @since 0.0.1
 */
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Db } from "mongodb"
import * as DocumentCollection from "./DocumentCollection.js"
import type * as MongoError from "./MongoError.js"

export const collection: {
  (name: string): (db: Db) => Effect.Effect<DocumentCollection.DocumentCollection>
  (db: Db, name: string): Effect.Effect<DocumentCollection.DocumentCollection>
} = F.dual(2, (db: Db, name: string) =>
  Effect.sync(() =>
    new DocumentCollection.DocumentCollection({
      collection: db.collection(name)
    })
  ))

export type DbService<K extends string> = {
  db: Effect.Effect<Db, MongoError.MongoError>
} & Brand.Brand<K>

export const Tag = <K extends string>(key: K) => Context.GenericTag<DbService<K>>(key)
