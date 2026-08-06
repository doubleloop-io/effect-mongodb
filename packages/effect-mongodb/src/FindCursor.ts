/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Pipeable } from "effect/Pipeable"
import { pipeArguments } from "effect/Pipeable"
import type * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import type * as SchemaError from "effect/SchemaError"
import * as Stream from "effect/Stream"
import * as Tuple from "effect/Tuple"
import type { Document, FindCursor as FindCursor_, Sort, SortDirection } from "mongodb"
import type { Filter as Filter_ } from "./internal/filter.js"
import { mongoErrorOrDie } from "./internal/mongo-error.js"
import * as MongoError from "./MongoError.js"

type FindCursorFields<A, I = A, R = never> = {
  cursor: FindCursor_<unknown>
  schema: Schema.Codec<A, I, R, R>
}

export interface FindCursor<A, I = A, R = never> extends FindCursorFields<A, I, R>, Pipeable {
  _tag: "FindCursor"
}

/** @internal */
export class FindCursorImpl<A, I = A, R = never> extends Data.TaggedClass("FindCursor")<FindCursorFields<A, I, R>>
  implements FindCursor<A, I, R>
{
  pipe() {
    return pipeArguments(this, arguments)
  }
}

export type Filter<TSchema> = Filter_<TSchema>

export const filter: {
  <I extends Document>(filter: Filter<I>): <A, R>(cursor: FindCursor<A, I, R>) => FindCursor<A, I, R>
  <A, I extends Document, R>(cursor: FindCursor<A, I, R>, filter: Filter<I>): FindCursor<A, I, R>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, I extends Document, R>(
    cursor: FindCursor<A, I, R>,
    filter: Filter<I>
  ): FindCursor<A, I, R> => new FindCursorImpl({ cursor: cursor.cursor.filter(filter), schema: cursor.schema })
)

export const project: {
  <B, BI, BR, T extends Document = Document>(
    newSchema: Schema.Codec<B, BI, BR, BR>,
    value: T
  ): <A, I, R>(cursor: FindCursor<A, I, R>) => FindCursor<B, BI, BR>
  <A, B, I, R, BI, BR, T extends Document = Document>(
    cursor: FindCursor<A, I, R>,
    newSchema: Schema.Codec<B, BI, BR, BR>,
    value: T
  ): FindCursor<B, BI, BR>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, B, I, R, BI, BR, T extends Document = Document>(
    cursor: FindCursor<A, I, R>,
    newSchema: Schema.Codec<B, BI, BR, BR>,
    value: T
  ): FindCursor<B, BI, BR> => new FindCursorImpl({ cursor: cursor.cursor.project(value), schema: newSchema })
)

export const sort: {
  (sort: Sort | string, direction?: SortDirection): <A, I, R>(cursor: FindCursor<A, I, R>) => FindCursor<A, I, R>
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
  ): FindCursor<A, I, R> => new FindCursorImpl({ cursor: cursor.cursor.sort(sort, direction), schema: cursor.schema })
)

export const limit: {
  (value: number): <A, I, R>(cursor: FindCursor<A, I, R>) => FindCursor<A, I, R>
  <A, I, R>(cursor: FindCursor<A, I, R>, value: number): FindCursor<A, I, R>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, I, R>(cursor: FindCursor<A, I, R>, value: number): FindCursor<A, I, R> =>
    new FindCursorImpl({ cursor: cursor.cursor.limit(value), schema: cursor.schema })
)

export const toArray = <A, I, R>(
  cursor: FindCursor<A, I, R>
): Effect.Effect<Array<A>, MongoError.MongoError | SchemaError.SchemaError, R> => {
  const decode = Schema.decodeUnknownEffect(cursor.schema)
  return Effect.promise(() => cursor.cursor.toArray()).pipe(
    Effect.catchDefect(mongoErrorOrDie(errorSource(cursor, "toArray"))),
    Effect.flatMap(Effect.forEach((x) => decode(x)))
  )
}

export const toArrayEither = <A, I, R>(
  cursor: FindCursor<A, I, R>
): Effect.Effect<
  Array<Result.Result<A, [document: unknown, error: SchemaError.SchemaError]>>,
  MongoError.MongoError,
  R
> => {
  const decode = Schema.decodeUnknownEffect(cursor.schema)
  return Effect.promise(() => cursor.cursor.toArray()).pipe(
    Effect.catchDefect(mongoErrorOrDie(errorSource(cursor, "toArrayEither"))),
    Effect.flatMap(Effect.forEach((x) =>
      F.pipe(
        decode(x),
        Effect.mapError((error) => Tuple.make(x, error)),
        Effect.result
      )
    ))
  )
}

export const toStream = <A, I, R>(
  cursor: FindCursor<A, I, R>
): Stream.Stream<A, MongoError.MongoError | SchemaError.SchemaError, R> => {
  const decode = Schema.decodeUnknownEffect(cursor.schema)
  return F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catch(F.flow(mongoErrorOrDie(errorSource(cursor, "toStream")), Stream.fromEffect)),
    Stream.mapEffect((x) => decode(x))
  )
}

export const toStreamEither = <A, I, R>(
  cursor: FindCursor<A, I, R>
): Stream.Stream<Result.Result<A, [document: unknown, error: SchemaError.SchemaError]>, MongoError.MongoError, R> => {
  const decode = Schema.decodeUnknownEffect(cursor.schema)
  return F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catch(F.flow(mongoErrorOrDie(errorSource(cursor, "toStreamEither")), Stream.fromEffect)),
    Stream.mapEffect((x) =>
      F.pipe(
        // keep new line
        decode(x),
        Effect.mapError((error) => Tuple.make(x, error)),
        Effect.result
      )
    )
  )
}

const isFindCursor = (x: unknown): x is FindCursor<unknown> => x instanceof FindCursorImpl

const errorSource = <A, I, R>(cursor: FindCursor<A, I, R>, functionName: string) =>
  new MongoError.CollectionErrorSource({
    module: FindCursorImpl.name,
    functionName,
    db: cursor.cursor.namespace.db,
    collection: cursor.cursor.namespace.collection ?? "NO_COLLECTION_NAME"
  })
