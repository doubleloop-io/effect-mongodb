/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Pipeable } from "effect/Pipeable"
import { pipeArguments } from "effect/Pipeable"
import * as Stream from "effect/Stream"
import type { AggregationCursor as MongoAggregationCursor, Document } from "mongodb"
import { mongoErrorOrDie } from "./internal/mongo-error.js"
import * as MongoError from "./MongoError.js"

type DocumentAggregationCursorFields = { cursor: MongoAggregationCursor<Document> }

export interface DocumentAggregationCursor extends DocumentAggregationCursorFields, Pipeable {
  _tag: "DocumentAggregationCursor"
}

/** @internal */
export class DocumentAggregationCursorImpl
  extends Data.TaggedClass("DocumentAggregationCursor")<DocumentAggregationCursorFields>
  implements DocumentAggregationCursor
{
  pipe() {
    return pipeArguments(this, arguments)
  }
}

export const toArray = (
  cursor: DocumentAggregationCursor
): Effect.Effect<Array<Document>, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => cursor.cursor.toArray()),
    Effect.catchAllDefect(mongoErrorOrDie(errorSource(cursor, "toArray")))
  )

export const toStream = (
  cursor: DocumentAggregationCursor
): Stream.Stream<Document, MongoError.MongoError> =>
  F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catchAll(mongoErrorOrDie(errorSource(cursor, "toStream")))
  )

const errorSource = (cursor: DocumentAggregationCursor, functionName: string) =>
  new MongoError.CollectionErrorSource({
    module: DocumentAggregationCursorImpl.name,
    functionName,
    db: cursor.cursor.namespace.db,
    collection: cursor.cursor.namespace.collection ?? "NO_COLLECTION_NAME"
  })
