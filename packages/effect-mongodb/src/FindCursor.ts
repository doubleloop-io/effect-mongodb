/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import type * as E from "effect/Either"
import * as F from "effect/Function"
import type * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import * as Tuple from "effect/Tuple"
import type { Document, FindCursor as FindCursor_, Sort, SortDirection } from "mongodb"
import type { Filter } from "./internal/filter.js"
import * as MongoError from "./MongoError.js"

export class FindCursor<A, I = A, R = never> extends Data.TaggedClass("FindCursor")<{
  cursor: FindCursor_<unknown>
  schema: Schema.Schema<A, I, R>
}> {
}

export const filter: {
  <I extends Document>(
    filter: Filter<I>
  ): <A, R>(cursor: FindCursor<A, I, R>) => FindCursor<A, I, R>
  <A, I extends Document, R>(
    cursor: FindCursor<A, I, R>,
    filter: Filter<I>
  ): FindCursor<A, I, R>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, I extends Document, R>(
    cursor: FindCursor<A, I, R>,
    filter: Filter<I>
  ): FindCursor<A, I, R> => new FindCursor({ cursor: cursor.cursor.filter(filter), schema: cursor.schema })
)

export const project: {
  <B, BI, BR, T extends Document = Document>(
    newSchema: Schema.Schema<B, BI, BR>,
    value: T
  ): <A, I, R>(cursor: FindCursor<A, I, R>) => FindCursor<B, BI, BR>
  <A, B, I, R, BI, BR, T extends Document = Document>(
    cursor: FindCursor<A, I, R>,
    newSchema: Schema.Schema<B, BI, BR>,
    value: T
  ): FindCursor<B, BI, BR>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, B, I, R, BI, BR, T extends Document = Document>(
    cursor: FindCursor<A, I, R>,
    newSchema: Schema.Schema<B, BI, BR>,
    value: T
  ): FindCursor<B, BI, BR> => new FindCursor({ cursor: cursor.cursor.project(value), schema: newSchema })
)

export const sort: {
  (
    sort: Sort | string,
    direction?: SortDirection
  ): <A, I, R>(cursor: FindCursor<A, I, R>) => FindCursor<A, I, R>
  <A, I, R>(
    cursor: FindCursor<A, I, R>,
    sort: Sort | string,
    direction?: SortDirection
  ): FindCursor<A, I, R>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, I, R>(
    cursor: FindCursor<A, I, R>,
    sort: Sort | string,
    direction?: SortDirection
  ): FindCursor<A, I, R> => new FindCursor({ cursor: cursor.cursor.sort(sort, direction), schema: cursor.schema })
)

export const limit: {
  (
    value: number
  ): <A, I, R>(cursor: FindCursor<A, I, R>) => FindCursor<A, I, R>
  <A, I, R>(cursor: FindCursor<A, I, R>, value: number): FindCursor<A, I, R>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, I, R>(cursor: FindCursor<A, I, R>, value: number): FindCursor<A, I, R> =>
    new FindCursor({ cursor: cursor.cursor.limit(value), schema: cursor.schema })
)

export const toArray = <A, I, R>(
  cursor: FindCursor<A, I, R>
): Effect.Effect<Array<A>, MongoError.MongoError | ParseResult.ParseError, R> => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return Effect.tryPromise({ try: () => cursor.cursor.toArray(), catch: F.identity }).pipe(
    Effect.catchAll(MongoError.mongoErrorDie<ReadonlyArray<A>>("Unable to get array from mongodb cursor")),
    Effect.flatMap(Effect.forEach((x) => decode(x)))
  )
}

export const toArrayEither = <A, I, R>(
  cursor: FindCursor<A, I, R>
): Effect.Effect<Array<E.Either<A, [document: unknown, error: ParseResult.ParseError]>>, MongoError.MongoError, R> => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return Effect.tryPromise({ try: () => cursor.cursor.toArray(), catch: F.identity }).pipe(
    Effect.catchAll(MongoError.mongoErrorDie<ReadonlyArray<A>>("Unable to get array from mongodb cursor")),
    Effect.flatMap(Effect.forEach((x) =>
      F.pipe(
        decode(x),
        Effect.mapError((error) => Tuple.make(x, error)),
        Effect.either
      )
    ))
  )
}

export const toStream = <A, I, R>(
  cursor: FindCursor<A, I, R>
): Stream.Stream<A, MongoError.MongoError | ParseResult.ParseError, R> => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catchAll(MongoError.mongoErrorStream<A>("Unable to get stream from mongodb cursor")),
    Stream.mapEffect((x) => decode(x))
  )
}

export const toStreamEither = <A, I, R>(
  cursor: FindCursor<A, I, R>
): Stream.Stream<E.Either<A, [document: unknown, error: ParseResult.ParseError]>, MongoError.MongoError, R> => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catchAll(MongoError.mongoErrorStream<A>("Unable to get stream either from mongodb cursor")),
    Stream.mapEffect((x) =>
      F.pipe(
        // keep new line
        decode(x),
        Effect.mapError((error) => Tuple.make(x, error)),
        Effect.either
      )
    )
  )
}

const isFindCursor = (x: unknown): x is FindCursor<unknown> => x instanceof FindCursor
