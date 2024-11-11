/**
 * @since 0.0.1
 */
import type * as ParseResult from "@effect/schema/ParseResult"
import * as Schema from "@effect/schema/Schema"
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
  FindOptions as MongoFindOptions,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  ReplaceOptions,
  UpdateFilter,
  UpdateOptions,
  UpdateResult
} from "mongodb"
import * as FindCursor from "./FindCursor.js"
import type { Filter } from "./internal/filter.js"
import * as MongoError from "./MongoError.js"

export class Collection<A extends Document, I extends Document = A, R = never> extends Data.TaggedClass("Collection")<{
  collection: MongoCollection
  schema: Schema.Schema<A, I, R>
}> {
}

export type FindOptions = Omit<MongoFindOptions, "projection">

export const find: {
  (
    options?: FindOptions
  ): <A extends Document, I extends Document, R>(collection: Collection<A, I, R>) => FindCursor.FindCursor<A, I, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    options?: FindOptions
  ): FindCursor.FindCursor<A, I, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    options?: FindOptions
  ): FindCursor.FindCursor<A, I, R> =>
    new FindCursor.FindCursor<A, I, R>({
      cursor: collection.collection.find({}, options),
      schema: collection.schema
    })
)

export const findOne: {
  <I extends Document>(
    filter: Filter<I>,
    options?: FindOptions
  ): <A extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<O.Option<Document>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: FindOptions
  ): Effect.Effect<O.Option<Document>, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: FindOptions
  ): Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R> =>
    Effect.gen(function*(_) {
      const value = yield* _(Effect.promise(() => collection.collection.findOne(filter, options)))
      if (value !== null) return O.some(yield* _(Schema.decodeUnknown(collection.schema)(value)))
      return O.none()
    }).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<O.Option<A>>("findOne error"))
    )
)

export const insertOne: {
  <A extends Document>(
    doc: A,
    options?: InsertOneOptions
  ): <I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    doc: A,
    options?: InsertOneOptions
  ): Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual((args) => isCollection(args[0]), <A extends Document, I extends Document, R>(
  collection: Collection<A, I, R>,
  doc: A,
  options?: InsertOneOptions
): Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, R> =>
  F.pipe(
    Schema.encode(collection.schema)(doc),
    Effect.flatMap((doc) => Effect.promise(() => collection.collection.insertOne(doc, options))),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertOneResult>("insertOne error"))
  ))

export const insertMany: {
  <A extends Document>(
    docs: Array<A>,
    options?: BulkWriteOptions
  ): <I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    docs: Array<A>,
    options?: BulkWriteOptions
  ): Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual((args) => isCollection(args[0]), <A extends Document, I extends Document, R>(
  collection: Collection<A, I, R>,
  docs: Array<A>,
  options?: BulkWriteOptions
): Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, R> => {
  const encode = Schema.encode(collection.schema)
  return F.pipe(
    docs,
    Effect.forEach((doc) => encode(doc)),
    Effect.flatMap((docs) => Effect.promise(() => collection.collection.insertMany(docs, options))),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertManyResult>("insertMany error"))
  )
})

export const deleteOne: {
  <I extends Document>(
    filter: Filter<I>,
    options?: DeleteOptions
  ): <A extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<DeleteResult, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, R> =>
    Effect.promise(() => collection.collection.deleteOne(filter, options)).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<DeleteResult>("deleteOne error"))
    )
)

export const deleteMany: {
  <I extends Document>(
    filter: Filter<I>,
    options?: DeleteOptions
  ): <A extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<DeleteResult, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, R> =>
    Effect.promise(() => collection.collection.deleteMany(filter, options)).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<DeleteResult>("deleteMany error"))
    )
)

export const updateMany: {
  <I extends Document>(
    filter: Filter<I>,
    update: UpdateFilter<I> | Array<Document>,
    options?: UpdateOptions
  ): <A extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<UpdateResult, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    update: UpdateFilter<I> | Array<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    update: UpdateFilter<I> | Array<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult, MongoError.MongoError, R> =>
    Effect.promise(() =>
      collection.collection.updateMany(filter, update as UpdateFilter<Document> | Array<Document>, options)
    ).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<UpdateResult>("updateMany error"))
    )
)

export const replaceOne: {
  <A extends Document, I extends Document>(
    filter: Filter<I>,
    // TODO: should we put WithoutId<A> here like the driver signature?
    replacement: A,
    options?: ReplaceOptions
  ): <R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<UpdateResult | Document, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A,
    options?: ReplaceOptions
  ): Effect.Effect<UpdateResult | Document, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A,
    options?: ReplaceOptions
  ): Effect.Effect<
    UpdateResult | Document,
    MongoError.MongoError | ParseResult.ParseError,
    R
  > =>
    F.pipe(
      // TODO: extract function in Collection
      Schema.encode(collection.schema)(replacement),
      Effect.flatMap((replacement) =>
        Effect.promise(() => collection.collection.replaceOne(filter, replacement, options))
      ),
      Effect.catchAllDefect(MongoError.mongoErrorDie<UpdateResult | Document>("replaceOne error"))
    )
)

const isCollection = (x: unknown) => x instanceof Collection
