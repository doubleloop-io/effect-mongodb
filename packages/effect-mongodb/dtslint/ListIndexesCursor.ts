import * as ListIndexesCursor from "effect-mongodb/ListIndexesCursor"

declare const cursor: ListIndexesCursor.ListIndexesCursor

// -------------------------------------------------------------------------------------
// toArray
// -------------------------------------------------------------------------------------

// $ExpectType Effect<IndexDescriptionInfo[], MongoError, never>
ListIndexesCursor.toArray(cursor)

// -------------------------------------------------------------------------------------
// toStream
// -------------------------------------------------------------------------------------

// $ExpectType Stream<IndexDescriptionInfo, MongoError, never>
ListIndexesCursor.toStream(cursor)
