/**
 * @since 0.0.1
 */
import * as Chunk from "effect/Chunk"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Stream from "effect/Stream"
import type {
  Document,
  Filter,
  FindOptions,
  InsertOneOptions,
  InsertOneResult,
  OptionalUnlessRequiredId
} from "mongodb"
import { Collection } from "mongodb"
import * as FindCursor from "./FindCursor.js"
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

export const findV2 = <T extends Document = Document>(
  collection: Collection<T>
): FindCursor.FindCursor =>
  new FindCursor.FindCursor(
    {
      cursor: collection.find()
    }
  )

export const insertOne: {
  <T extends Document = Document>(
    doc: OptionalUnlessRequiredId<T>,
    options?: InsertOneOptions
  ): (
    collection: Collection<T>
  ) => Effect.Effect<InsertOneResult<T>, MongoError.MongoError>
  <T extends Document = Document>(
    collection: Collection<T>,
    doc: OptionalUnlessRequiredId<T>,
    options?: InsertOneOptions
  ): Effect.Effect<InsertOneResult<T>, MongoError.MongoError>
} = F.dual((args) => isCollection(args[0]), <T extends Document = Document>(
  collection: Collection<T>,
  doc: OptionalUnlessRequiredId<T>,
  options?: InsertOneOptions
): Effect.Effect<InsertOneResult<T>, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => collection.insertOne(doc, options)),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertOneResult<T>>("insertOne error"))
  ))

export const toArray = F.flow(
  Stream.runCollect,
  Effect.map(Chunk.toReadonlyArray)
)

const isCollection = (x: unknown) => x instanceof Collection
