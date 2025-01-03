/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Stream from "effect/Stream"
import type {
  CollectionInfo as MongoCollectionInfo,
  ListCollectionsCursor as MongoListCollectionsCursor
} from "mongodb"
import * as MongoError from "./MongoError.js"

export type NameOnlyCollectionInfo = Pick<MongoCollectionInfo, "name" | "type">
export type FullCollectionInfo = MongoCollectionInfo

type DefaultCollectionInfo = NameOnlyCollectionInfo | FullCollectionInfo

export class ListCollectionsCursor<
  T extends DefaultCollectionInfo = DefaultCollectionInfo
> extends Data.TaggedClass("ListCollectionsCursor")<{
  cursor: MongoListCollectionsCursor<T>
}> {}

export type NameOnlyListCollectionsCursor = ListCollectionsCursor<
  Pick<MongoCollectionInfo, "name" | "type">
>

export type FullListCollectionsCursor = ListCollectionsCursor<MongoCollectionInfo>

export const toArray = <T extends DefaultCollectionInfo>(
  cursor: ListCollectionsCursor<T>
): Effect.Effect<Array<T>, MongoError.MongoError> =>
  F.pipe(
    Effect.tryPromise({ try: () => cursor.cursor.toArray(), catch: F.identity }),
    Effect.catchAll(MongoError.mongoErrorDie<Array<T>>(`${cursor._tag}.toArray error`))
  )

export const toStream = <T extends DefaultCollectionInfo>(
  cursor: ListCollectionsCursor<T>
): Stream.Stream<T, MongoError.MongoError> =>
  F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catchAll(MongoError.mongoErrorStream<T>(`${cursor._tag}.toStream error`))
  )
