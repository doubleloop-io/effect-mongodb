/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Stream from "effect/Stream"
import type { AggregationCursor as MongoAggregationCursor } from "mongodb"
import * as MongoError from "./MongoError.js"

export class DocumentAggregationCursor
  extends Data.TaggedClass("DocumentAggregationCursor")<{ cursor: MongoAggregationCursor<Document> }>
{
}

export const toArray = (
  cursor: DocumentAggregationCursor
): Effect.Effect<Array<Document>, MongoError.MongoError> =>
  F.pipe(
    Effect.tryPromise({ try: () => cursor.cursor.toArray(), catch: F.identity }),
    Effect.catchAll(MongoError.mongoErrorDie<Array<Document>>(`${cursor._tag}.toArray error`))
  )

export const toStream = (
  cursor: DocumentAggregationCursor
): Stream.Stream<Document, MongoError.MongoError> =>
  F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catchAll(MongoError.mongoErrorStream<Document>(`${cursor._tag}.toStream error`))
  )
