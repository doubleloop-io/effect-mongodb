import * as FindCursor from "effect-mongodb/FindCursor"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"

const User = Schema.Struct({
  id: Schema.NumberFromString,
  name: Schema.String
})
type User = typeof User.Type
type UserEncoded = typeof User.Encoded
type UserDecodingServices = typeof User.DecodingServices
type UserEncodingServices = typeof User.EncodingServices

declare const cursor: FindCursor.FindCursor<User, UserEncoded, UserDecodingServices, UserEncodingServices>

// -------------------------------------------------------------------------------------
// filter
// -------------------------------------------------------------------------------------

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never, never>
FindCursor.filter(cursor, { id: "1" })

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never, never>
F.pipe(cursor, FindCursor.filter({ id: "1" }))

// -------------------------------------------------------------------------------------
// project
// -------------------------------------------------------------------------------------

const UserProjection = Schema.Struct({
  id: User.fields.id
})

// $ExpectType FindCursor<{ readonly id: number; }, { readonly id: string; }, never, never>
FindCursor.project(cursor, UserProjection, { _id: 0, id: 1 })

// $ExpectType FindCursor<{ readonly id: number; }, { readonly id: string; }, never, never>
F.pipe(cursor, FindCursor.project(UserProjection, { _id: 0, id: 1 }))

// -------------------------------------------------------------------------------------
// sort
// -------------------------------------------------------------------------------------

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never, never>
FindCursor.sort(cursor, { name: 1 })

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never, never>
F.pipe(cursor, FindCursor.sort({ name: 1 }))

// -------------------------------------------------------------------------------------
// limit
// -------------------------------------------------------------------------------------

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never, never>
FindCursor.limit(cursor, 50)

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never, never>
F.pipe(cursor, FindCursor.limit(50))

// -------------------------------------------------------------------------------------
// toArray
// -------------------------------------------------------------------------------------

// $ExpectType Effect<{ readonly id: number; readonly name: string; }[], MongoError | SchemaError, never>
FindCursor.toArray(cursor)

// -------------------------------------------------------------------------------------
// toArrayResult
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Result<{ readonly id: number; readonly name: string; }, [document: unknown, error: SchemaError]>[], MongoError, never>
FindCursor.toArrayResult(cursor)

// -------------------------------------------------------------------------------------
// toStream
// -------------------------------------------------------------------------------------

// $ExpectType Stream<{ readonly id: number; readonly name: string; }, MongoError | SchemaError, never>
FindCursor.toStream(cursor)

// -------------------------------------------------------------------------------------
// toStreamResult
// -------------------------------------------------------------------------------------

// $ExpectType Stream<Result<{ readonly id: number; readonly name: string; }, [document: unknown, error: SchemaError]>, MongoError, never>
FindCursor.toStreamResult(cursor)

// -------------------------------------------------------------------------------------
// decoding and encoding services
// -------------------------------------------------------------------------------------

interface Dec {
  readonly Dec: unique symbol
}
interface Enc {
  readonly Enc: unique symbol
}
declare const cursorWithServices: FindCursor.FindCursor<User, UserEncoded, Dec, Enc>

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, Dec, Enc>
F.pipe(cursorWithServices, FindCursor.filter({ id: "1" }), FindCursor.sort({ name: 1 }), FindCursor.limit(50))

// $ExpectType Effect<{ readonly id: number; readonly name: string; }[], MongoError | SchemaError, Dec>
FindCursor.toArray(cursorWithServices)

// $ExpectType Effect<Result<{ readonly id: number; readonly name: string; }, [document: unknown, error: SchemaError]>[], MongoError, Dec>
FindCursor.toArrayResult(cursorWithServices)

// $ExpectType Stream<{ readonly id: number; readonly name: string; }, MongoError | SchemaError, Dec>
FindCursor.toStream(cursorWithServices)

// $ExpectType Stream<Result<{ readonly id: number; readonly name: string; }, [document: unknown, error: SchemaError]>, MongoError, Dec>
FindCursor.toStreamResult(cursorWithServices)

declare const UserProjectionWithServices: Schema.Codec<{ readonly id: number }, { readonly id: string }, Dec, Enc>

// $ExpectType FindCursor<{ readonly id: number; }, { readonly id: string; }, Dec, Enc>
FindCursor.project(cursor, UserProjectionWithServices, { _id: 0, id: 1 })

// $ExpectType FindCursor<{ readonly id: number; }, { readonly id: string; }, Dec, Enc>
F.pipe(cursor, FindCursor.project(UserProjectionWithServices, { _id: 0, id: 1 }))
