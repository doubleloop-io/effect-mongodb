/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type * as Schema from "effect/Schema"
import type {
  CreateCollectionOptions,
  Db as Db_,
  Document,
  DropCollectionOptions,
  ListCollectionsOptions
} from "mongodb"
import type * as Collection from "./Collection.js"
import * as DocumentCollection from "./DocumentCollection.js"
import { mongoOperation } from "./internal/mongo-operation.js"
import type { Server } from "./internal/server.js"
import * as ListCollectionsCursor from "./ListCollectionsCursor.js"
import * as MongoError from "./MongoError.js"

export class Db extends Data.TaggedClass("Db")<{ db: Db_; server: Server }> {}

export const documentCollection: {
  (name: string): (db: Db) => DocumentCollection.DocumentCollection
  (db: Db, name: string): DocumentCollection.DocumentCollection
} = F.dual(
  (args) => isDb(args[0]),
  (db: Db, name: string): DocumentCollection.DocumentCollection =>
    new DocumentCollection.DocumentCollectionImpl({
      collection: db.db.collection(name),
      server: db.server
    })
)

export const collection: {
  <A extends Document, I extends Document = A, RD = never, RE = never>(
    name: string,
    schema: Schema.Codec<A, I, RD, RE>
  ): (db: Db) => Collection.Collection<A, I, RD, RE>
  <A extends Document, I extends Document = A, RD = never, RE = never>(
    db: Db,
    name: string,
    schema: Schema.Codec<A, I, RD, RE>
  ): Collection.Collection<A, I, RD, RE>
} = F.dual(
  (args) => isDb(args[0]),
  <A extends Document, I extends Document = A, RD = never, RE = never>(
    db: Db,
    name: string,
    schema: Schema.Codec<A, I, RD, RE>
  ): Collection.Collection<A, I, RD, RE> => DocumentCollection.typed(documentCollection(db, name), schema)
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
    new ListCollectionsCursor.ListCollectionsCursorImpl({
      cursor: db.db.listCollections(filter, options),
      server: db.server
    })
)

export const createCollection: {
  (name: string): (db: Db) => Effect.Effect<DocumentCollection.DocumentCollection, MongoError.MongoError>
  (
    name: string,
    options: CreateCollectionOptions
  ): (db: Db) => Effect.Effect<DocumentCollection.DocumentCollection, MongoError.MongoError>
  (db: Db, name: string): Effect.Effect<DocumentCollection.DocumentCollection, MongoError.MongoError>
  (
    db: Db,
    name: string,
    options: CreateCollectionOptions
  ): Effect.Effect<DocumentCollection.DocumentCollection, MongoError.MongoError>
} = F.dual(
  (args) => isDb(args[0]),
  (
    db: Db,
    name: string,
    options?: CreateCollectionOptions
  ): Effect.Effect<DocumentCollection.DocumentCollection, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => db.db.createCollection(name, options)),
      Effect.map((collection) => new DocumentCollection.DocumentCollectionImpl({ collection, server: db.server })),
      mongoOperation(errorSource(db, "createCollection"))
    )
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
      Effect.promise(() => db.db.dropCollection(name, options)),
      mongoOperation(errorSource(db, "dropCollection"))
    )
)

const isDb = (x: unknown) => x instanceof Db

const errorSource = (db: Db, functionName: string) =>
  new MongoError.DbErrorSource({ module: "Db", functionName, db: db.db.databaseName, ...db.server })
