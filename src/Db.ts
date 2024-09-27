/**
 * @since 0.0.1
 */
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Layer from "effect/Layer"
import type { Db } from "mongodb"
import * as DocumentCollection from "./DocumentCollection.js"
import * as MongoClient from "./MongoClient.js"
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
export type TagType<K extends string> = ReturnType<typeof Tag<K>>

export const fromEffect = <DbK extends string, MongoClientK extends string, E = never, R = never>(
  dbTag: TagType<DbK>,
  clientTag: MongoClient.TagType<MongoClientK>,
  dbName: Effect.Effect<string, E, R>
) =>
  Layer.effect(
    dbTag,
    Effect.gen(function*(_) {
      const { client } = yield* _(clientTag)
      const dbName_ = yield* _(dbName)
      const db = yield* _(
        client,
        Effect.flatMap((client) => MongoClient.db(client, dbName_)),
        Effect.cached
      )
      return dbTag.of({ db } as DbService<DbK>) // TODO fix cast using branded ctor
    })
  )

export const fromConst = <DbK extends string, MongoClientK extends string>(
  dbTag: TagType<DbK>,
  clientTag: MongoClient.TagType<MongoClientK>,
  dbName: string
) => fromEffect(dbTag, clientTag, Effect.succeed(dbName))
