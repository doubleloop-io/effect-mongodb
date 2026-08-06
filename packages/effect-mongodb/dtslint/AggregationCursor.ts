import * as AggregationCursor from "effect-mongodb/AggregationCursor"
import * as Schema from "effect/Schema"

const User = Schema.Struct({
  id: Schema.String
})
type User = typeof User.Type
type UserEncoded = typeof User.Encoded
type UserContext = typeof User.DecodingServices

declare const cursor: AggregationCursor.AggregationCursor<User, UserEncoded, UserContext>

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
