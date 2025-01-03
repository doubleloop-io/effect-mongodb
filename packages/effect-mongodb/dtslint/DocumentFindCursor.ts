import * as DocumentFindCursor from "effect-mongodb/DocumentFindCursor"
import * as F from "effect/Function"
import * as Schema from "effect/Schema"

declare const cursor: DocumentFindCursor.DocumentFindCursor

// -------------------------------------------------------------------------------------
// filter
// -------------------------------------------------------------------------------------

// $ExpectType DocumentFindCursor
DocumentFindCursor.filter(cursor, { id: "1" })

// $ExpectType DocumentFindCursor
F.pipe(cursor, DocumentFindCursor.filter({ id: "1" }))

// -------------------------------------------------------------------------------------
// project
// -------------------------------------------------------------------------------------

// $ExpectType DocumentFindCursor
DocumentFindCursor.project(cursor, { _id: 0, id: 1 })

// $ExpectType DocumentFindCursor
F.pipe(cursor, DocumentFindCursor.project({ _id: 0, id: 1 }))

// -------------------------------------------------------------------------------------
// sort
// -------------------------------------------------------------------------------------

// $ExpectType DocumentFindCursor
DocumentFindCursor.sort(cursor, { name: 1 })

// $ExpectType DocumentFindCursor
F.pipe(cursor, DocumentFindCursor.sort({ name: 1 }))

// -------------------------------------------------------------------------------------
// limit
// -------------------------------------------------------------------------------------

// $ExpectType DocumentFindCursor
DocumentFindCursor.limit(cursor, 50)

// $ExpectType DocumentFindCursor
F.pipe(cursor, DocumentFindCursor.limit(50))

// -------------------------------------------------------------------------------------
// toArray
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Document[], MongoError, never>
DocumentFindCursor.toArray(cursor)

// -------------------------------------------------------------------------------------
// toStream
// -------------------------------------------------------------------------------------

// $ExpectType Stream<Document, MongoError, never>
DocumentFindCursor.toStream(cursor)

// -------------------------------------------------------------------------------------
// typed
// -------------------------------------------------------------------------------------

const User = Schema.Struct({ name: Schema.String })

// $ExpectType FindCursor<{ readonly name: string; }, { readonly name: string; }, never>
DocumentFindCursor.typed(cursor, User)

// $ExpectType FindCursor<{ readonly name: string; }, { readonly name: string; }, never>
F.pipe(cursor, DocumentFindCursor.typed(User))
