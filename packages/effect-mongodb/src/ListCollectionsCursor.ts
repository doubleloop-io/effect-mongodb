/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Pipeable } from "effect/Pipeable"
import { pipeArguments } from "effect/Pipeable"
import * as Stream from "effect/Stream"
import type {
  CollectionInfo as MongoCollectionInfo,
  ListCollectionsCursor as MongoListCollectionsCursor
} from "mongodb"
import { mongoErrorOrDie } from "./internal/mongo-error.js"
import * as MongoError from "./MongoError.js"

export type NameOnlyCollectionInfo = Pick<MongoCollectionInfo, "name" | "type">
export type FullCollectionInfo = MongoCollectionInfo

type DefaultCollectionInfo = NameOnlyCollectionInfo | FullCollectionInfo

type ListCollectionsCursorFields<T extends DefaultCollectionInfo = DefaultCollectionInfo> = {
  cursor: MongoListCollectionsCursor<T>
}

export interface ListCollectionsCursor<T extends DefaultCollectionInfo = DefaultCollectionInfo>
  extends ListCollectionsCursorFields<T>, Pipeable
{
  _tag: "ListCollectionsCursor"
}

/** @internal */
export class ListCollectionsCursorImpl<
  T extends DefaultCollectionInfo = DefaultCollectionInfo
> extends Data.TaggedClass("ListCollectionsCursor")<ListCollectionsCursorFields<T>> implements Pipeable {
  pipe() {
    return pipeArguments(this, arguments)
  }
}

export type NameOnlyListCollectionsCursor = ListCollectionsCursor<
  Pick<MongoCollectionInfo, "name" | "type">
>

export type FullListCollectionsCursor = ListCollectionsCursor<MongoCollectionInfo>

export const toArray = <T extends DefaultCollectionInfo>(
  cursor: ListCollectionsCursor<T>
): Effect.Effect<Array<T>, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => cursor.cursor.toArray()),
    Effect.catchAllDefect(mongoErrorOrDie(errorSource(cursor, "toArray")))
  )

export const toStream = <T extends DefaultCollectionInfo>(
  cursor: ListCollectionsCursor<T>
): Stream.Stream<T, MongoError.MongoError> =>
  F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catchAll(mongoErrorOrDie(errorSource(cursor, "toStream")))
  )

const errorSource = (cursor: ListCollectionsCursor, functionName: string) =>
  new MongoError.CollectionErrorSource({
    module: ListCollectionsCursorImpl.name,
    functionName,
    db: cursor.cursor.namespace.db,
    collection: cursor.cursor.namespace.collection ?? "NO_COLLECTION_NAME"
  })
