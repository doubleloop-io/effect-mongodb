/**
 * @since 0.0.1
 */
import type * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Document, FindCursor, Sort, SortDirection } from "mongodb"
import * as MongoError from "./MongoError.js"
import * as TypedFindCursor from "./TypedFindCursor.js"

export class UnknownFindCursor extends Data.TaggedClass("UnknownFindCursor")<{
  cursor: FindCursor<unknown>
}> {
}

export const filter: {
  <T extends Document = Document>(
    filter: T
  ): (cursor: UnknownFindCursor) => UnknownFindCursor
  <T extends Document = Document>(cursor: UnknownFindCursor, filter: T): UnknownFindCursor
} = F.dual(
  2,
  <T extends Document = Document>(cursor: UnknownFindCursor, filter: T): UnknownFindCursor =>
    new UnknownFindCursor({ cursor: cursor.cursor.filter(filter) })
)

export const project: {
  <T extends Document = Document>(
    value: T
  ): (cursor: UnknownFindCursor) => UnknownFindCursor
  <T extends Document = Document>(cursor: UnknownFindCursor, value: T): UnknownFindCursor
} = F.dual(
  2,
  <T extends Document = Document>(cursor: UnknownFindCursor, value: T): UnknownFindCursor =>
    new UnknownFindCursor({ cursor: cursor.cursor.project(value) })
)

export const sort: {
  (
    sort: Sort | string,
    direction?: SortDirection
  ): (cursor: UnknownFindCursor) => UnknownFindCursor
  (cursor: UnknownFindCursor, sort: Sort | string, direction?: SortDirection): UnknownFindCursor
} = F.dual(
  (args) => isFindCursor(args[0]),
  (cursor: UnknownFindCursor, sort: Sort | string, direction?: SortDirection): UnknownFindCursor =>
    new UnknownFindCursor({ cursor: cursor.cursor.sort(sort, direction) })
)

export const limit: {
  (
    value: number
  ): (cursor: UnknownFindCursor) => UnknownFindCursor
  (cursor: UnknownFindCursor, value: number): UnknownFindCursor
} = F.dual(
  2,
  (cursor: UnknownFindCursor, value: number): UnknownFindCursor =>
    new UnknownFindCursor({ cursor: cursor.cursor.limit(value) })
)

export const toArray = (cursor: UnknownFindCursor): Effect.Effect<ReadonlyArray<unknown>, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => cursor.cursor.toArray()),
    Effect.catchAll(MongoError.mongoErrorDie<ReadonlyArray<unknown>>("toArray error"))
  )

export const typed: {
  <A, I = A, R = never>(
    schema: Schema.Schema<A, I, R>
  ): (cursor: UnknownFindCursor) => TypedFindCursor.TypedFindCursor<A, I, R>
  <A, I = A, R = never>(
    cursor: UnknownFindCursor,
    schema: Schema.Schema<A, I, R>
  ): TypedFindCursor.TypedFindCursor<A, I, R>
} = F.dual(2, <A, I = A, R = never>(
  cursor: UnknownFindCursor,
  schema: Schema.Schema<A, I, R>
): TypedFindCursor.TypedFindCursor<A, I, R> =>
  new TypedFindCursor.TypedFindCursor<A, I, R>({ cursor: cursor.cursor, schema }))

const isFindCursor = (x: unknown) => x instanceof UnknownFindCursor
