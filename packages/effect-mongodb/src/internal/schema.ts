import * as Effect from "effect/Effect"
import * as O from "effect/Option"
import * as Schema from "effect/Schema"
import type { Document } from "mongodb"

// TODO: there is probably a Schema to do this decode or using typeclass package for traverse
export const decodeNullableDocument = <A, I, R>(schema: Schema.Schema<A, I, R>, value: Document | null) =>
  Effect.gen(function*(_) {
    if (value === null) return O.none()
    const decoded = yield* _(Schema.decodeUnknown(schema)(value))
    return O.some(decoded)
  })
