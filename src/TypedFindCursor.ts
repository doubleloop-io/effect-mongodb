/**
 * @since 0.0.1
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Document, FindCursor as FindCursor_, Sort, SortDirection } from "mongodb"

export class TypedFindCursor<A, I = A, R = never> extends Data.TaggedClass("TypedFindCursor")<{
  cursor: FindCursor_<unknown>
  schema: Schema.Schema<A, I, R>
}> {}

export const filter: {
  <T extends Document = Document>(
    filter: T
  ): <A, I = A, R = never>(cursor: TypedFindCursor<A, I, R>) => TypedFindCursor<A, I, R>
  <A, I = A, R = never, T extends Document = Document>(
    cursor: TypedFindCursor<A, I, R>,
    filter: T
  ): TypedFindCursor<A, I, R>
} = F.dual(
  2,
  <A, I = A, R = never, T extends Document = Document>(
    cursor: TypedFindCursor<A, I, R>,
    filter: T
  ): TypedFindCursor<A, I, R> => new TypedFindCursor({ cursor: cursor.cursor.filter(filter), schema: cursor.schema })
)

export const project: {
  <B, BI = B, BR = never, T extends Document = Document>(
    newSchema: Schema.Schema<B, BI, BR>,
    value: T
  ): <A, I = A, R = never>(cursor: TypedFindCursor<A, I, R>) => TypedFindCursor<B, BI, BR>
  <A, B, I = A, R = never, BI = B, BR = never, T extends Document = Document>(
    cursor: TypedFindCursor<A, I, R>,
    newSchema: Schema.Schema<B, BI, BR>,
    value: T
  ): TypedFindCursor<B, BI, BR>
} = F.dual(
  3,
  <A, B, I = A, R = never, BI = B, BR = never, T extends Document = Document>(
    cursor: TypedFindCursor<A, I, R>,
    newSchema: Schema.Schema<B, BI, BR>,
    value: T
  ): TypedFindCursor<B, BI, BR> => new TypedFindCursor({ cursor: cursor.cursor.project(value), schema: newSchema })
)

export const sort: {
  (
    sort: Sort | string,
    direction?: SortDirection
  ): <A, I = A, R = never>(cursor: TypedFindCursor<A, I, R>) => TypedFindCursor<A, I, R>
  <A, I = A, R = never>(
    cursor: TypedFindCursor<A, I, R>,
    sort: Sort | string,
    direction?: SortDirection
  ): TypedFindCursor<A, I, R>
} = F.dual(
  (args) => isTypedFindCursor(args[0]),
  <A, I = A, R = never>(
    cursor: TypedFindCursor<A, I, R>,
    sort: Sort | string,
    direction?: SortDirection
  ): TypedFindCursor<A, I, R> =>
    new TypedFindCursor({ cursor: cursor.cursor.sort(sort, direction), schema: cursor.schema })
)

export const limit: {
  (
    value: number
  ): <A, I = A, R = never>(cursor: TypedFindCursor<A, I, R>) => TypedFindCursor<A, I, R>
  <A, I = A, R = never>(cursor: TypedFindCursor<A, I, R>, value: number): TypedFindCursor<A, I, R>
} = F.dual(
  2,
  <A, I = A, R = never>(cursor: TypedFindCursor<A, I, R>, value: number): TypedFindCursor<A, I, R> =>
    new TypedFindCursor({ cursor: cursor.cursor.limit(value), schema: cursor.schema })
)

export const toArray = <A, I = A, R = never>(cursor: TypedFindCursor<A, I, R>) => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return Effect.promise(() => cursor.cursor.toArray()).pipe(Effect.flatMap(Effect.forEach((x) => decode(x))))
}

const isTypedFindCursor = (x: unknown): x is TypedFindCursor<unknown> => x instanceof TypedFindCursor
