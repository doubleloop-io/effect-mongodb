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
import * as MongoError from "./MongoError.js"

export class AggregationCursor<A, I = A, R = never> extends Data.TaggedClass("AggregationCursor")<
  { cursor: MongoAggregationCursor<unknown>; schema: Schema.Schema<A, I, R> }
> {
}

export const toArray = <A, I, R>(
  cursor: AggregationCursor<A, I, R>
): Effect.Effect<ReadonlyArray<A>, MongoError.MongoError | ParseResult.ParseError, R> => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return Effect.tryPromise({ try: () => cursor.cursor.toArray(), catch: F.identity }).pipe(
    Effect.catchAll(MongoError.mongoErrorDie<ReadonlyArray<A>>("Unable to get array from mongodb aggregate cursor")),
    Effect.flatMap(Effect.forEach((x) => decode(x)))
  )
}

export const toStream = <A, I, R>(
  cursor: AggregationCursor<A, I, R>
): Stream.Stream<A, MongoError.MongoError | ParseResult.ParseError, R> => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catchAll(MongoError.mongoErrorStream<A>("Unable to get stream from mongodb aggregate cursor")),
    Stream.mapEffect((x) => decode(x))
  )
}
