/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Pipeable } from "effect/Pipeable"
import { pipeArguments } from "effect/Pipeable"
import * as Stream from "effect/Stream"
import type { IndexDescriptionInfo, ListIndexesCursor as MongoListIndexesCursor } from "mongodb"
import { mongoOperation, mongoStreamOperation } from "./internal/mongo-operation.js"
import type { Server } from "./internal/server.js"
import * as MongoError from "./MongoError.js"

type ListIndexesCursorFields = {
  cursor: MongoListIndexesCursor
  server: Server
}

export interface ListIndexesCursor extends ListIndexesCursorFields, Pipeable {
  _tag: "ListIndexesCursor"
}

/** @internal */
export class ListIndexesCursorImpl extends Data.TaggedClass("ListIndexesCursor")<ListIndexesCursorFields>
  implements ListIndexesCursor
{
  pipe() {
    return pipeArguments(this, arguments)
  }
}

export const toArray = (
  cursor: ListIndexesCursor
): Effect.Effect<Array<IndexDescriptionInfo>, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => cursor.cursor.toArray()),
    mongoOperation(errorSource(cursor, "toArray"))
  )

export const toStream = (
  cursor: ListIndexesCursor
): Stream.Stream<IndexDescriptionInfo, MongoError.MongoError> =>
  F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    mongoStreamOperation(errorSource(cursor, "toStream"))
  )

const errorSource = (cursor: ListIndexesCursor, functionName: string) =>
  new MongoError.CollectionErrorSource({
    module: "ListIndexesCursor",
    functionName,
    db: cursor.cursor.namespace.db,
    collection: cursor.cursor.namespace.collection ?? "NO_COLLECTION_NAME",
    ...cursor.server
  })
