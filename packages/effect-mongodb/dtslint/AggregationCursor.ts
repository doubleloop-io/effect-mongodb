import * as AggregationCursor from "effect-mongodb/AggregationCursor"
import * as Schema from "effect/Schema"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const User = Schema.Struct({
  id: Schema.String
})
type User = typeof User.Type
type UserEncoded = typeof User.Encoded
type UserDecodingServices = typeof User.DecodingServices
type UserEncodingServices = typeof User.EncodingServices

declare const cursor: AggregationCursor.AggregationCursor<User, UserEncoded, UserDecodingServices, UserEncodingServices>

// -------------------------------------------------------------------------------------
// toArray
// -------------------------------------------------------------------------------------

// $ExpectType Effect<{ readonly id: string; }[], MongoError | SchemaError, never>
AggregationCursor.toArray(cursor)

// -------------------------------------------------------------------------------------
// toStream
// -------------------------------------------------------------------------------------

// $ExpectType Stream<{ readonly id: string; }, MongoError | SchemaError, never>
AggregationCursor.toStream(cursor)

// -------------------------------------------------------------------------------------
// decoding and encoding services
// -------------------------------------------------------------------------------------

interface Dec {
  readonly Dec: unique symbol
}
interface Enc {
  readonly Enc: unique symbol
}
declare const cursorWithServices: AggregationCursor.AggregationCursor<User, UserEncoded, Dec, Enc>

// $ExpectType Effect<{ readonly id: string; }[], MongoError | SchemaError, Dec>
AggregationCursor.toArray(cursorWithServices)

// $ExpectType Stream<{ readonly id: string; }, MongoError | SchemaError, Dec>
AggregationCursor.toStream(cursorWithServices)
