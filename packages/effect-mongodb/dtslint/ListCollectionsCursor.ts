import * as ListCollectionsCursor from "effect-mongodb/ListCollectionsCursor"

declare const cursor: ListCollectionsCursor.ListCollectionsCursor<ListCollectionsCursor.FullCollectionInfo>

// -------------------------------------------------------------------------------------
// toArray
// -------------------------------------------------------------------------------------

// $ExpectType Effect<CollectionInfo[], MongoError, never>
ListCollectionsCursor.toArray(cursor)

// -------------------------------------------------------------------------------------
// toStream
// -------------------------------------------------------------------------------------

// $ExpectType Stream<CollectionInfo, MongoError, never>
ListCollectionsCursor.toStream(cursor)
