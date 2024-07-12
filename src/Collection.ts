import * as Chunk from "effect/Chunk"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Stream from "effect/Stream"
import type { Collection, Document, Filter, FindOptions } from "mongodb"
import * as MongoError from "./MongoError.js"

export const find: {
  <T extends Document = Document>(
    filter?: Filter<T>,
    options?: FindOptions
  ): (
    collection: Collection<T>
  ) => Stream.Stream<T, MongoError.MongoError>
  <T extends Document = Document>(
    collection: Collection<T>,
    filter?: Filter<T>,
    options?: FindOptions
  ): Stream.Stream<T, MongoError.MongoError>
} = F.dual(3, <T extends Document = Document>(
  collection: Collection<T>,
  filter?: Filter<T>,
  options?: FindOptions
): Stream.Stream<T, MongoError.MongoError> =>
  F.pipe(
    Stream.fromAsyncIterable(collection.find<T>(filter ?? {}, options), (x) => x),
    Stream.catchAll(MongoError.mongoErrorDie<T>("find error"))
  ))

export const toArray = F.flow(
  Stream.runCollect,
  Effect.map(Chunk.toReadonlyArray)
)
