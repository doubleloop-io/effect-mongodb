import * as FindCursor from "effect-mongodb/FindCursor"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"

const User = Schema.Struct({
  id: Schema.NumberFromString,
  name: Schema.String
})
type User = typeof User.Type
type UserEncoded = typeof User.Encoded
type UserContext = typeof User.Context

declare const cursor: FindCursor.FindCursor<User, UserEncoded, UserContext>

// -------------------------------------------------------------------------------------
// filter
// -------------------------------------------------------------------------------------

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never>
FindCursor.filter(cursor, { id: "1" })

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never>
F.pipe(cursor, FindCursor.filter({ id: "1" }))

// -------------------------------------------------------------------------------------
// project
// -------------------------------------------------------------------------------------

const UserProjection = Schema.Struct({
  id: User.fields.id
})

// $ExpectType FindCursor<{ readonly id: number; }, { readonly id: string; }, never>
FindCursor.project(cursor, UserProjection, { _id: 0, id: 1 })

// $ExpectType FindCursor<{ readonly id: number; }, { readonly id: string; }, never>
F.pipe(cursor, FindCursor.project(UserProjection, { _id: 0, id: 1 }))

// -------------------------------------------------------------------------------------
// sort
// -------------------------------------------------------------------------------------

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never>
FindCursor.sort(cursor, { name: 1 })

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never>
F.pipe(cursor, FindCursor.sort({ name: 1 }))

// -------------------------------------------------------------------------------------
// limit
// -------------------------------------------------------------------------------------

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never>
FindCursor.limit(cursor, 50)

// $ExpectType FindCursor<{ readonly id: number; readonly name: string; }, { readonly id: string; readonly name: string; }, never>
F.pipe(cursor, FindCursor.limit(50))

// -------------------------------------------------------------------------------------
// toArray
// -------------------------------------------------------------------------------------

// $ExpectType Effect<{ readonly id: number; readonly name: string; }[], MongoError | ParseError, never>
FindCursor.toArray(cursor)

// -------------------------------------------------------------------------------------
// toArrayEither
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Either<{ readonly id: number; readonly name: string; }, [document: unknown, error: ParseError]>[], MongoError, never>
FindCursor.toArrayEither(cursor)

// -------------------------------------------------------------------------------------
// toStream
// -------------------------------------------------------------------------------------

// $ExpectType Stream<{ readonly id: number; readonly name: string; }, MongoError | ParseError, never>
FindCursor.toStream(cursor)

// -------------------------------------------------------------------------------------
// toStreamEither
// -------------------------------------------------------------------------------------

// $ExpectType Stream<Either<{ readonly id: number; readonly name: string; }, [document: unknown, error: ParseError]>, MongoError, never>
FindCursor.toStreamEither(cursor)
