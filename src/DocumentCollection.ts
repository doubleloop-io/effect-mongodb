/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as O from "effect/Option"
import type {
  BulkWriteOptions,
  Collection,
  Document,
  Filter,
  FindOptions,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  OptionalUnlessRequiredId
} from "mongodb"
import * as MongoError from "./MongoError.js"
import * as UnknownFindCursor from "./UnknownFindCursor.js"

export class DocumentCollection extends Data.TaggedClass("DocumentCollection")<{
  collection: Collection
}> {
}

export const find = (
  collection: DocumentCollection
): UnknownFindCursor.UnknownFindCursor =>
  new UnknownFindCursor.UnknownFindCursor(
    {
      cursor: collection.collection.find()
    }
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
  (args) => isCollection(args[0]),
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
} = F.dual((args) => isCollection(args[0]), (
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
} = F.dual((args) => isCollection(args[0]), (
  collection: DocumentCollection,
  docs: Array<OptionalUnlessRequiredId<Document>>,
  options?: BulkWriteOptions
): Effect.Effect<InsertManyResult, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => collection.collection.insertMany(docs, options)),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertManyResult>("insertMany error"))
  ))

const isCollection = (x: unknown) => x instanceof DocumentCollection
