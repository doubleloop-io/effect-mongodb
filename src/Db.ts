/**
 * @since 0.0.1
 */
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Db } from "mongodb"
import * as DocumentCollection from "./DocumentCollection.js"

export const collection: {
  (name: string): (db: Db) => Effect.Effect<DocumentCollection.DocumentCollection>
  (db: Db, name: string): Effect.Effect<DocumentCollection.DocumentCollection>
} = F.dual(2, (db: Db, name: string) =>
  Effect.sync(() =>
    new DocumentCollection.DocumentCollection({
      collection: db.collection(name)
    })
  ))
