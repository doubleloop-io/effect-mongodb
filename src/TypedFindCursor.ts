/**
 * @since 0.0.1
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import type { FindCursor as FindCursor_ } from "mongodb"

export class TypedFindCursor<A, I = A, R = never> extends Data.TaggedClass("TypedFindCursor")<{
  cursor: FindCursor_<unknown>
  schema: Schema.Schema<A, I, R>
}> {}

export const toArray = <A, I = A, R = never>(cursor: TypedFindCursor<A, I, R>) => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return Effect.promise(() => cursor.cursor.toArray()).pipe(Effect.flatMap(Effect.forEach((x) => decode(x))))
}
