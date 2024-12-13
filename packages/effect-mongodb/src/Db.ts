/**
 * @since 0.0.1
 */
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type * as Schema from "effect/Schema"
import type { Document, DropCollectionOptions, ListCollectionsOptions } from "mongodb"
import { Db } from "mongodb"
import type * as Collection from "./Collection.js"
import * as DocumentCollection from "./DocumentCollection.js"
import * as ListCollectionsCursor from "./ListCollectionsCursor.js"
import * as MongoError from "./MongoError.js"

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

export const listCollections: {
  (db: Db): ListCollectionsCursor.ListCollectionsCursor
  (filter: Document): (db: Db) => ListCollectionsCursor.ListCollectionsCursor
  (
    filter: Document,
    options: Exclude<ListCollectionsOptions, "nameOnly"> & { nameOnly: true }
  ): (db: Db) => ListCollectionsCursor.NameOnlyListCollectionsCursor
  (
    filter: Document,
    options: Exclude<ListCollectionsOptions, "nameOnly"> & { nameOnly: false }
  ): (db: Db) => ListCollectionsCursor.FullListCollectionsCursor
  (db: Db, filter: Document): ListCollectionsCursor.ListCollectionsCursor
  (
    db: Db,
    filter: Document,
    options: Exclude<ListCollectionsOptions, "nameOnly"> & { nameOnly: true }
  ): ListCollectionsCursor.NameOnlyListCollectionsCursor
  (
    db: Db,
    filter: Document,
    options: Exclude<ListCollectionsOptions, "nameOnly"> & { nameOnly: false }
  ): ListCollectionsCursor.FullListCollectionsCursor
} = F.dual(
  (args) => isDb(args[0]),
  (db: Db, filter?: Document, options?: ListCollectionsOptions): ListCollectionsCursor.ListCollectionsCursor =>
    new ListCollectionsCursor.ListCollectionsCursor({ cursor: db.listCollections(filter, options) })
)

export const dropCollection: {
  (name: string): (db: Db) => Effect.Effect<boolean, MongoError.MongoError>
  (name: string, options: DropCollectionOptions): (db: Db) => Effect.Effect<boolean, MongoError.MongoError>
  (db: Db, name: string): Effect.Effect<boolean, MongoError.MongoError>
  (db: Db, name: string, options: DropCollectionOptions): Effect.Effect<boolean, MongoError.MongoError>
} = F.dual(
  (args) => isDb(args[0]),
  (db: Db, name: string, options?: DropCollectionOptions): Effect.Effect<boolean, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => db.dropCollection(name, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<boolean>("dropCollection error"))
    )
)

const isDb = (x: unknown) => x instanceof Db
