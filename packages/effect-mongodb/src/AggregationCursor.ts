/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import type { AggregationCursor as MongoAggregationCursor } from "mongodb"
import { mongoErrorOrDie, mongoErrorOrDieStream } from "./internal/mongo-error.js"
import * as MongoError from "./MongoError.js"

export class AggregationCursor<A, I = A, R = never> extends Data.TaggedClass("AggregationCursor")<
  { cursor: MongoAggregationCursor<unknown>; schema: Schema.Schema<A, I, R> }
> {
}

export const toArray = <A, I, R>(
  cursor: AggregationCursor<A, I, R>
): Effect.Effect<Array<A>, MongoError.MongoError | ParseResult.ParseError, R> => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return Effect.tryPromise({ try: () => cursor.cursor.toArray(), catch: F.identity }).pipe(
    Effect.catchAll(mongoErrorOrDie(makeSource(cursor, "toArray"))),
    Effect.flatMap(Effect.forEach((x) => decode(x)))
  )
}

export const toStream = <A, I, R>(
  cursor: AggregationCursor<A, I, R>
): Stream.Stream<A, MongoError.MongoError | ParseResult.ParseError, R> => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catchAll(mongoErrorOrDieStream(makeSource(cursor, "toStream"))),
    Stream.mapEffect((x) => decode(x))
  )
}

const makeSource = <A, I, R>(cursor: AggregationCursor<A, I, R>, functionName: string) =>
  new MongoError.CollectionErrorSource({
    module: AggregationCursor.name,
    functionName,
    db: cursor.cursor.namespace.db,
    collection: cursor.cursor.namespace.collection ?? "NO_COLLECTION_NAME"
  })
