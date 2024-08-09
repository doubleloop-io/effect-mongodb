/**
 * @since 0.0.1
 */
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as O from "effect/Option"
import type {
  BulkWriteOptions,
  Document,
  Filter,
  FindOptions,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  OptionalUnlessRequiredId
} from "mongodb"
import { Collection } from "mongodb"
import * as MongoError from "./MongoError.js"
import * as UnknownFindCursor from "./UnknownFindCursor.js"

export const find = <T extends Document = Document>(
  collection: Collection<T>
): UnknownFindCursor.UnknownFindCursor =>
  new UnknownFindCursor.UnknownFindCursor(
    {
      cursor: collection.find()
    }
  )

export const findOne: {
  <T extends Document = Document>(
    filter: Filter<T>,
    options?: FindOptions
  ): (
    collection: Collection<T>
  ) => Effect.Effect<O.Option<T>, MongoError.MongoError>
  <T extends Document = Document>(
    collection: Collection<T>,
    filter: Filter<T>,
    options?: FindOptions
  ): Effect.Effect<O.Option<T>, MongoError.MongoError>
} = F.dual(
  (args) => isCollection(args[0]),
  <T extends Document = Document>(
    collection: Collection<T>,
    filter: Filter<T>,
    options?: FindOptions
  ): Effect.Effect<O.Option<T>, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.findOne(filter, options)),
      Effect.map((value) => O.fromNullable(value)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<O.Option<T>>("findOne error"))
    )
)

export const insertOne: {
  <T extends Document = Document>(
    doc: OptionalUnlessRequiredId<T>,
    options?: InsertOneOptions
  ): (
    collection: Collection<T>
  ) => Effect.Effect<InsertOneResult<T>, MongoError.MongoError>
  <T extends Document = Document>(
    collection: Collection<T>,
    doc: OptionalUnlessRequiredId<T>,
    options?: InsertOneOptions
  ): Effect.Effect<InsertOneResult<T>, MongoError.MongoError>
} = F.dual((args) => isCollection(args[0]), <T extends Document = Document>(
  collection: Collection<T>,
  doc: OptionalUnlessRequiredId<T>,
  options?: InsertOneOptions
): Effect.Effect<InsertOneResult<T>, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => collection.insertOne(doc, options)),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertOneResult<T>>("insertOne error"))
  ))

export const insertMany: {
  <T extends Document = Document>(
    docs: Array<OptionalUnlessRequiredId<T>>,
    options?: BulkWriteOptions
  ): (
    collection: Collection<T>
  ) => Effect.Effect<InsertOneResult<T>, MongoError.MongoError>
  <T extends Document = Document>(
    collection: Collection<T>,
    docs: Array<OptionalUnlessRequiredId<T>>,
    options?: BulkWriteOptions
  ): Effect.Effect<InsertOneResult<T>, MongoError.MongoError>
} = F.dual((args) => isCollection(args[0]), <T extends Document = Document>(
  collection: Collection<T>,
  docs: Array<OptionalUnlessRequiredId<T>>,
  options?: BulkWriteOptions
): Effect.Effect<InsertManyResult<T>, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => collection.insertMany(docs, options)),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertManyResult<T>>("insertMany error"))
  ))

const isCollection = (x: unknown) => x instanceof Collection
