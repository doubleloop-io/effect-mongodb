import type * as ParseResult from "@effect/schema/ParseResult"
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as O from "effect/Option"
import type {
  BulkWriteOptions,
  Collection as MongoCollection,
  Document,
  Filter,
  FindOptions as MongoFindOptions,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult
} from "mongodb"
import * as FindCursor from "./FindCursor.js"
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
  ): <A extends Document, I extends Document = A, R = never>(
    collection: Collection<A, I, R>
  ) => FindCursor.FindCursor<A, I, R>
  <A extends Document, I extends Document = A, R = never>(
    collection: Collection<A, I, R>,
    options?: FindOptions
  ): FindCursor.FindCursor<A, I, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document = A, R = never>(
    collection: Collection<A, I, R>,
    options?: FindOptions
  ): FindCursor.FindCursor<A, I, R> =>
    new FindCursor.FindCursor<A, I, R>({
      cursor: collection.collection.find({}, options),
      schema: collection.schema
    })
)

export const findOne: {
  <A extends Document, I extends Document = A, R = never>(
    filter: Filter<I>,
    options?: FindOptions
  ): (
    collection: Collection<A, I, R>
  ) => Effect.Effect<O.Option<Document>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document = A, R = never>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: FindOptions
  ): Effect.Effect<O.Option<Document>, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document = A, R = never>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: FindOptions
  ): Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R> =>
    Effect.gen(function*(_) {
      const value = yield* _(Effect.promise(() => collection.collection.findOne(filter as Filter<Document>, options)))
      if (value !== null) return O.some(yield* _(Schema.decodeUnknown(collection.schema)(value)))
      return O.none()
    }).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<O.Option<A>>("findOne error"))
    )
)

export const insertOne: {
  <A extends Document, I extends Document = A, R = never>(
    doc: A,
    options?: InsertOneOptions
  ): (
    collection: Collection<A, I, R>
  ) => Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document = A, R = never>(
    collection: Collection<A, I, R>,
    doc: A,
    options?: InsertOneOptions
  ): Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual((args) => isCollection(args[0]), <A extends Document, I extends Document = A, R = never>(
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
  <A extends Document, I extends Document = A, R = never>(
    docs: Array<A>,
    options?: BulkWriteOptions
  ): (
    collection: Collection<A, I, R>
  ) => Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document = A, R = never>(
    collection: Collection<A, I, R>,
    docs: Array<A>,
    options?: BulkWriteOptions
  ): Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual((args) => isCollection(args[0]), <A extends Document, I extends Document = A, R = never>(
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

const isCollection = (x: unknown) => x instanceof Collection
