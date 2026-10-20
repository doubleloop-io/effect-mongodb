import * as Schema from "effect/Schema"
import type { Document } from "mongodb"

export const decodeNullableDocument = <A, I, RD>(schema: Schema.Codec<A, I, RD, unknown>, value: Document | null) =>
  Schema.decodeUnknownEffect(Schema.OptionFromNullOr(schema))(value)
