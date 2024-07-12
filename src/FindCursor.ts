import type * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import type { FindCursor as FindCursor_ } from "mongodb"
import * as TypedFindCursor from "./TypedFindCursor.js"

export class FindCursor extends Data.TaggedClass("FindCursor")<{
  cursor: FindCursor_<unknown>
}> {}

export const toArray = (cursor: FindCursor): Effect.Effect<ReadonlyArray<unknown>> =>
  Effect.promise(() => cursor.cursor.toArray())

export const typed = <A, I = A, R = never>(
  cursor: FindCursor,
  schema: Schema.Schema<A, I, R>
): TypedFindCursor.TypedFindCursor<A, I, R> =>
  new TypedFindCursor.TypedFindCursor<A, I, R>({ cursor: cursor.cursor, schema })
