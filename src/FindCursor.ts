/**
 * @since 0.0.1
 */
import type * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Document, FindCursor as FindCursor_ } from "mongodb"
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

export const toArray = (cursor: FindCursor): Effect.Effect<ReadonlyArray<unknown>> =>
  Effect.promise(() => cursor.cursor.toArray())

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
