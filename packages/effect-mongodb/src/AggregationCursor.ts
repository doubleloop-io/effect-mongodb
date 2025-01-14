/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type * as ParseResult from "effect/ParseResult"
import type { Pipeable } from "effect/Pipeable"
import { pipeArguments } from "effect/Pipeable"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import type { AggregationCursor as MongoAggregationCursor } from "mongodb"
import { mongoErrorOrDie } from "./internal/mongo-error.js"
import * as MongoError from "./MongoError.js"

interface AggregationCursorFields<A, I = A, R = never> {
  cursor: MongoAggregationCursor<unknown>
  schema: Schema.Schema<A, I, R>
}

export interface AggregationCursor<A, I = A, R = never> extends AggregationCursorFields<A, I, R>, Pipeable {
  _tag: "AggregationCursor"
}

/** @internal */
export class AggregationCursorImpl<A, I = A, R = never>
  extends Data.TaggedClass("AggregationCursor")<AggregationCursorFields<A, I, R>>
  implements AggregationCursor<A, I, R>
{
  pipe() {
    return pipeArguments(this, arguments)
  }
}

export const toArray = <A, I, R>(
  cursor: AggregationCursor<A, I, R>
): Effect.Effect<Array<A>, MongoError.MongoError | ParseResult.ParseError, R> => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return Effect.promise(() => cursor.cursor.toArray()).pipe(
    Effect.catchAllDefect(mongoErrorOrDie(errorSource(cursor, "toArray"))),
    Effect.flatMap(Effect.forEach((x) => decode(x)))
  )
}

export const toStream = <A, I, R>(
  cursor: AggregationCursor<A, I, R>
): Stream.Stream<A, MongoError.MongoError | ParseResult.ParseError, R> => {
  const decode = Schema.decodeUnknown(cursor.schema)
  return F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catchAll(mongoErrorOrDie(errorSource(cursor, "toStream"))),
    Stream.mapEffect((x) => decode(x))
  )
}

const errorSource = <A, I, R>(cursor: AggregationCursor<A, I, R>, functionName: string) =>
  new MongoError.CollectionErrorSource({
    module: AggregationCursorImpl.name,
    functionName,
    db: cursor.cursor.namespace.db,
    collection: cursor.cursor.namespace.collection ?? "NO_COLLECTION_NAME"
  })
