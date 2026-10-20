/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Pipeable } from "effect/Pipeable"
import type * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import * as Tuple from "effect/Tuple"
import type {
  Collection as MongoCollection,
  Document,
  Filter as MongoFilter,
  FindOptions as MongoFindOptions,
  Sort,
  SortDirection
} from "mongodb"
import type { Filter as Filter_ } from "./internal/filter.js"
import { mongoOperation, mongoStreamOperation } from "./internal/mongo-operation.js"
import * as MongoError from "./MongoError.js"

type FindCursorFields<A, I = A, RD = never, RE = never> = {
  collection: MongoCollection
  filter: MongoFilter<Document>
  options: MongoFindOptions
  schema: Schema.Codec<A, I, RD, RE>
}

export interface FindCursor<A, I = A, RD = never, RE = never> extends FindCursorFields<A, I, RD, RE>, Pipeable {
  _tag: "FindCursor"
}

/** @internal */
export class FindCursorImpl<A, I = A, RD = never, RE = never>
  extends Data.TaggedClass("FindCursor")<FindCursorFields<A, I, RD, RE>>
  implements FindCursor<A, I, RD, RE>
{}

export type Filter<TSchema> = Filter_<TSchema>

export const filter: {
  <I extends Document>(filter: Filter<I>): <A, RD, RE>(cursor: FindCursor<A, I, RD, RE>) => FindCursor<A, I, RD, RE>
  <A, I extends Document, RD, RE>(cursor: FindCursor<A, I, RD, RE>, filter: Filter<I>): FindCursor<A, I, RD, RE>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, I extends Document, RD, RE>(
    cursor: FindCursor<A, I, RD, RE>,
    filter: Filter<I>
  ): FindCursor<A, I, RD, RE> => new FindCursorImpl({ ...cursor, filter })
)

export const project: {
  <B, BI, BRD, BRE, T extends Document = Document>(
    newSchema: Schema.Codec<B, BI, BRD, BRE>,
    value: T
  ): <A, I, RD, RE>(cursor: FindCursor<A, I, RD, RE>) => FindCursor<B, BI, BRD, BRE>
  <A, B, I, RD, RE, BI, BRD, BRE, T extends Document = Document>(
    cursor: FindCursor<A, I, RD, RE>,
    newSchema: Schema.Codec<B, BI, BRD, BRE>,
    value: T
  ): FindCursor<B, BI, BRD, BRE>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, B, I, RD, RE, BI, BRD, BRE, T extends Document = Document>(
    cursor: FindCursor<A, I, RD, RE>,
    newSchema: Schema.Codec<B, BI, BRD, BRE>,
    value: T
  ): FindCursor<B, BI, BRD, BRE> =>
    new FindCursorImpl({ ...cursor, schema: newSchema, options: { ...cursor.options, projection: value } })
)

export const sort: {
  (
    sort: Sort | string,
    direction?: SortDirection
  ): <A, I, RD, RE>(cursor: FindCursor<A, I, RD, RE>) => FindCursor<A, I, RD, RE>
  <A, I, RD, RE>(
    cursor: FindCursor<A, I, RD, RE>,
    sort: Sort | string,
    direction?: SortDirection
  ): FindCursor<A, I, RD, RE>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, I, RD, RE>(
    cursor: FindCursor<A, I, RD, RE>,
    sort: Sort | string,
    direction?: SortDirection
  ): FindCursor<A, I, RD, RE> =>
    new FindCursorImpl({ ...cursor, options: { ...cursor.options, sort: sortOption(sort, direction) } })
)

export const limit: {
  (value: number): <A, I, RD, RE>(cursor: FindCursor<A, I, RD, RE>) => FindCursor<A, I, RD, RE>
  <A, I, RD, RE>(cursor: FindCursor<A, I, RD, RE>, value: number): FindCursor<A, I, RD, RE>
} = F.dual(
  (args) => isFindCursor(args[0]),
  <A, I, RD, RE>(cursor: FindCursor<A, I, RD, RE>, value: number): FindCursor<A, I, RD, RE> =>
    new FindCursorImpl({ ...cursor, options: { ...cursor.options, limit: value } })
)

export const toArray = <A, I, RD, RE>(
  cursor: FindCursor<A, I, RD, RE>
): Effect.Effect<Array<A>, MongoError.MongoError | Schema.SchemaError, RD> => {
  const decode = Schema.decodeUnknownEffect(cursor.schema)
  return Effect.promise(() => nativeCursor(cursor).toArray()).pipe(
    mongoOperation(errorSource(cursor, "toArray")),
    Effect.flatMap(Effect.forEach((x) => decode(x)))
  )
}

export const toArrayResult = <A, I, RD, RE>(
  cursor: FindCursor<A, I, RD, RE>
): Effect.Effect<
  Array<Result.Result<A, [document: unknown, error: Schema.SchemaError]>>,
  MongoError.MongoError,
  RD
> => {
  const decode = Schema.decodeUnknownEffect(cursor.schema)
  return Effect.promise(() => nativeCursor(cursor).toArray()).pipe(
    mongoOperation(errorSource(cursor, "toArrayResult")),
    Effect.flatMap(Effect.forEach((x) =>
      F.pipe(
        decode(x),
        Effect.mapError((error) => Tuple.make(x, error)),
        Effect.result
      )
    ))
  )
}

export const toStream = <A, I, RD, RE>(
  cursor: FindCursor<A, I, RD, RE>
): Stream.Stream<A, MongoError.MongoError | Schema.SchemaError, RD> => {
  const decode = Schema.decodeUnknownEffect(cursor.schema)
  return F.pipe(
    Stream.suspend(() => Stream.fromAsyncIterable(nativeCursor(cursor), F.identity)),
    mongoStreamOperation(errorSource(cursor, "toStream")),
    Stream.mapEffect((x) => decode(x))
  )
}

export const toStreamResult = <A, I, RD, RE>(
  cursor: FindCursor<A, I, RD, RE>
): Stream.Stream<Result.Result<A, [document: unknown, error: Schema.SchemaError]>, MongoError.MongoError, RD> => {
  const decode = Schema.decodeUnknownEffect(cursor.schema)
  return F.pipe(
    Stream.suspend(() => Stream.fromAsyncIterable(nativeCursor(cursor), F.identity)),
    mongoStreamOperation(errorSource(cursor, "toStreamResult")),
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

/** @internal */
export const sortOption = (sort: Sort | string, direction?: SortDirection): Sort =>
  typeof sort === "string" && direction !== undefined ? { [sort]: direction } : sort

const nativeCursor = <A, I, RD, RE>(cursor: FindCursor<A, I, RD, RE>) =>
  cursor.collection.find(cursor.filter, cursor.options)

const isFindCursor = (x: unknown): x is FindCursor<unknown> => x instanceof FindCursorImpl

const errorSource = <A, I, RD, RE>(cursor: FindCursor<A, I, RD, RE>, functionName: string) =>
  new MongoError.CollectionErrorSource({
    module: "FindCursor",
    functionName,
    db: cursor.collection.dbName,
    collection: cursor.collection.collectionName
  })
