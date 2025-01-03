import * as DocumentAggregationCursor from "effect-mongodb/DocumentAggregationCursor"

declare const cursor: DocumentAggregationCursor.DocumentAggregationCursor

// -------------------------------------------------------------------------------------
// toArray
// -------------------------------------------------------------------------------------

// $ExpectType Effect<Document[], MongoError, never>
DocumentAggregationCursor.toArray(cursor)

// -------------------------------------------------------------------------------------
// toStream
// -------------------------------------------------------------------------------------

// $ExpectType Stream<Document, MongoError, never>
DocumentAggregationCursor.toStream(cursor)
