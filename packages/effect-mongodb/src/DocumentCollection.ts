/**
 * @since 0.0.1
 */
import type * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as O from "effect/Option"
import type {
  BulkWriteOptions,
  Collection as MongoCollection,
  DeleteOptions,
  DeleteResult,
  Document,
  Filter,
  FindOptions,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  OptionalUnlessRequiredId,
  RenameOptions,
  ReplaceOptions,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
  WithoutId
} from "mongodb"
import * as Collection from "./Collection.js"
import * as DocumentFindCursor from "./DocumentFindCursor.js"
import * as MongoError from "./MongoError.js"

export class DocumentCollection extends Data.TaggedClass("DocumentCollection")<{
  collection: MongoCollection
}> {
}

export const find: {
  (options?: FindOptions): (collection: DocumentCollection) => DocumentFindCursor.DocumentFindCursor
  (
    collection: DocumentCollection,
    options?: FindOptions
  ): DocumentFindCursor.DocumentFindCursor
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (collection: DocumentCollection, options?: FindOptions) =>
    new DocumentFindCursor.DocumentFindCursor(
      {
        cursor: collection.collection.find({}, options)
      }
    )
)

export const findOne: {
  (
    filter: Filter<Document>,
    options?: FindOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<O.Option<Document>, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: FindOptions
  ): Effect.Effect<O.Option<Document>, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: FindOptions
  ): Effect.Effect<O.Option<Document>, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.findOne(filter, options)),
      Effect.map((value) => O.fromNullable(value)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<O.Option<Document>>("findOne error"))
    )
)

export const insertOne: {
  (
    doc: OptionalUnlessRequiredId<Document>,
    options?: InsertOneOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<InsertOneResult, MongoError.MongoError>
  (
    collection: DocumentCollection,
    doc: OptionalUnlessRequiredId<Document>,
    options?: InsertOneOptions
  ): Effect.Effect<InsertOneResult, MongoError.MongoError>
} = F.dual((args) => isDocumentCollection(args[0]), (
  collection: DocumentCollection,
  doc: OptionalUnlessRequiredId<Document>,
  options?: InsertOneOptions
): Effect.Effect<InsertOneResult, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => collection.collection.insertOne(doc, options)),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertOneResult>("insertOne error"))
  ))

export const insertMany: {
  (
    docs: Array<OptionalUnlessRequiredId<Document>>,
    options?: BulkWriteOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<InsertOneResult, MongoError.MongoError>
  (
    collection: DocumentCollection,
    docs: Array<OptionalUnlessRequiredId<Document>>,
    options?: BulkWriteOptions
  ): Effect.Effect<InsertOneResult, MongoError.MongoError>
} = F.dual((args) => isDocumentCollection(args[0]), (
  collection: DocumentCollection,
  docs: Array<OptionalUnlessRequiredId<Document>>,
  options?: BulkWriteOptions
): Effect.Effect<InsertManyResult, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => collection.collection.insertMany(docs, options)),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertManyResult>("insertMany error"))
  ))

export const deleteOne: {
  (
    filter: Filter<Document>,
    options?: DeleteOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<DeleteResult, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.deleteOne(filter, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<DeleteResult>("deleteOne error"))
    )
)

export const deleteMany: {
  (
    filter: Filter<Document>,
    options?: DeleteOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<DeleteResult, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.deleteMany(filter, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<DeleteResult>("deleteMany error"))
    )
)

export const updateMany: {
  (
    filter: Filter<Document>,
    update: UpdateFilter<Document> | Array<Document>,
    options?: UpdateOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<UpdateResult, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    update: UpdateFilter<Document> | Array<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    update: UpdateFilter<Document> | Array<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.updateMany(filter, update, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<UpdateResult>("updateMany error"))
    )
)

export const replaceOne: {
  (
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options?: ReplaceOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<UpdateResult | Document, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options?: ReplaceOptions
  ): Effect.Effect<UpdateResult | Document, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options?: ReplaceOptions
  ): Effect.Effect<UpdateResult | Document, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.replaceOne(filter, replacement, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<UpdateResult | Document>("replaceOne error"))
    )
)

export const rename: {
  (
    newName: string,
    options?: RenameOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<MongoCollection, MongoError.MongoError>
  (
    collection: DocumentCollection,
    newName: string,
    options?: RenameOptions
  ): Effect.Effect<MongoCollection, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    newName: string,
    options?: RenameOptions
  ): Effect.Effect<MongoCollection, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.rename(newName, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<MongoCollection>("rename error"))
    )
)

export const typed: {
  <A extends Document, I extends Document = A, R = never>(
    schema: Schema.Schema<A, I, R>
  ): (collection: DocumentCollection) => Collection.Collection<A, I, R>
  <A extends Document, I extends Document = A, R = never>(
    collection: DocumentCollection,
    schema: Schema.Schema<A, I, R>
  ): Collection.Collection<A, I, R>
} = F.dual((args) => isDocumentCollection(args[0]), <A extends Document, I extends Document = A, R = never>(
  collection: DocumentCollection,
  schema: Schema.Schema<A, I, R>
): Collection.Collection<A, I, R> => new Collection.Collection<A, I, R>({ collection: collection.collection, schema }))

const isDocumentCollection = (x: unknown) => x instanceof DocumentCollection
