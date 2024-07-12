import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Collection, Db, Document } from "mongodb"

export const collection: {
  <T extends Document = Document>(name: string): (db: Db) => Effect.Effect<Collection<T>>
  <T extends Document = Document>(db: Db, name: string): Effect.Effect<Collection<T>>
} = F.dual(2, <T extends Document = Document>(db: Db, name: string) => Effect.sync(() => db.collection<T>(name)))
