/**
 * @since 0.0.1
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Brand from "effect/Brand"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Layer from "effect/Layer"
import type { Document } from "mongodb"
import { Db } from "mongodb"
import type * as Collection from "./Collection.js"
import * as DocumentCollection from "./DocumentCollection.js"
import * as MongoClient from "./MongoClient.js"
import type * as MongoError from "./MongoError.js"

export const documentCollection: {
  (name: string): (db: Db) => DocumentCollection.DocumentCollection
  (db: Db, name: string): DocumentCollection.DocumentCollection
} = F.dual(
  (args) => isDb(args[0]),
  (db: Db, name: string): DocumentCollection.DocumentCollection =>
    new DocumentCollection.DocumentCollection({
      collection: db.collection(name)
    })
)

export const collection: {
  <A extends Document, I extends Document = A, R = never>(
    name: string,
    schema: Schema.Schema<A, I, R>
  ): (db: Db) => Collection.Collection<A, I, R>
  <A extends Document, I extends Document = A, R = never>(
    db: Db,
    name: string,
    schema: Schema.Schema<A, I, R>
  ): Collection.Collection<A, I, R>
} = F.dual(
  (args) => isDb(args[0]),
  <A extends Document, I extends Document = A, R = never>(
    db: Db,
    name: string,
    schema: Schema.Schema<A, I, R>
  ): Collection.Collection<A, I, R> => DocumentCollection.typed(documentCollection(db, name), schema)
)

const isDb = (x: unknown) => x instanceof Db

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
        Effect.map((client) => MongoClient.db(client, dbName_)),
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
