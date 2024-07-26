/**
 * @since 0.0.1
 */
import type * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Document, FindCursor as FindCursor_, Sort, SortDirection } from "mongodb"
import * as MongoError from "./MongoError.js"
import * as TypedFindCursor from "./TypedFindCursor.js"

export class FindCursor extends Data.TaggedClass("FindCursor")<{
  cursor: FindCursor_<unknown>
}> {
}

export const filter: {
  <T extends Document = Document>(
    filter: T
  ): (cursor: FindCursor) => FindCursor
  <T extends Document = Document>(cursor: FindCursor, filter: T): FindCursor
} = F.dual(
  2,
  <T extends Document = Document>(cursor: FindCursor, filter: T): FindCursor =>
    new FindCursor({ cursor: cursor.cursor.filter(filter) })
)

export const project: {
  <T extends Document = Document>(
    value: T
  ): (cursor: FindCursor) => FindCursor
  <T extends Document = Document>(cursor: FindCursor, value: T): FindCursor
} = F.dual(
  2,
  <T extends Document = Document>(cursor: FindCursor, value: T): FindCursor =>
    new FindCursor({ cursor: cursor.cursor.project(value) })
)

export const sort: {
  (
    sort: Sort | string,
    direction?: SortDirection
  ): (cursor: FindCursor) => FindCursor
  (cursor: FindCursor, sort: Sort | string, direction?: SortDirection): FindCursor
} = F.dual(
  (args) => isFindCursor(args[0]),
  (cursor: FindCursor, sort: Sort | string, direction?: SortDirection): FindCursor =>
    new FindCursor({ cursor: cursor.cursor.sort(sort, direction) })
)

export const limit: {
  (
    value: number
  ): (cursor: FindCursor) => FindCursor
  (cursor: FindCursor, value: number): FindCursor
} = F.dual(
  2,
  (cursor: FindCursor, value: number): FindCursor => new FindCursor({ cursor: cursor.cursor.limit(value) })
)

export const toArray = (cursor: FindCursor): Effect.Effect<ReadonlyArray<unknown>, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => cursor.cursor.toArray()),
    Effect.catchAll(MongoError.mongoErrorDie<ReadonlyArray<unknown>>("toArray error"))
  )

export const typed: {
  <A, I = A, R = never>(
    schema: Schema.Schema<A, I, R>
  ): (cursor: FindCursor) => TypedFindCursor.TypedFindCursor<A, I, R>
  <A, I = A, R = never>(
    cursor: FindCursor,
    schema: Schema.Schema<A, I, R>
  ): TypedFindCursor.TypedFindCursor<A, I, R>
} = F.dual(2, <A, I = A, R = never>(
  cursor: FindCursor,
  schema: Schema.Schema<A, I, R>
): TypedFindCursor.TypedFindCursor<A, I, R> =>
  new TypedFindCursor.TypedFindCursor<A, I, R>({ cursor: cursor.cursor, schema }))

const isFindCursor = (x: unknown) => x instanceof FindCursor
