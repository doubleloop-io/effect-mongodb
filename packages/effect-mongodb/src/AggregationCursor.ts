/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type { Pipeable } from "effect/Pipeable"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import type { AggregationCursor as MongoAggregationCursor } from "mongodb"
import { mongoOperation, mongoStreamOperation } from "./internal/mongo-operation.js"
import * as MongoError from "./MongoError.js"

interface AggregationCursorFields<A, I = A, RD = never, RE = never> {
  cursor: MongoAggregationCursor<unknown>
  schema: Schema.Codec<A, I, RD, RE>
}

export interface AggregationCursor<A, I = A, RD = never, RE = never>
  extends AggregationCursorFields<A, I, RD, RE>, Pipeable
{
  _tag: "AggregationCursor"
}

/** @internal */
export class AggregationCursorImpl<A, I = A, RD = never, RE = never>
  extends Data.TaggedClass("AggregationCursor")<AggregationCursorFields<A, I, RD, RE>>
  implements AggregationCursor<A, I, RD, RE>
{}

export const toArray = <A, I, RD, RE>(
  cursor: AggregationCursor<A, I, RD, RE>
): Effect.Effect<Array<A>, MongoError.MongoError | Schema.SchemaError, RD> => {
  const decode = Schema.decodeUnknownEffect(cursor.schema)
  return Effect.promise(() => cursor.cursor.toArray()).pipe(
    mongoOperation(errorSource(cursor, "toArray")),
    Effect.flatMap(Effect.forEach((x) => decode(x)))
  )
}

export const toStream = <A, I, RD, RE>(
  cursor: AggregationCursor<A, I, RD, RE>
): Stream.Stream<A, MongoError.MongoError | Schema.SchemaError, RD> => {
  const decode = Schema.decodeUnknownEffect(cursor.schema)
  return F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    mongoStreamOperation(errorSource(cursor, "toStream")),
    Stream.mapEffect((x) => decode(x))
  )
}

const errorSource = <A, I, RD, RE>(cursor: AggregationCursor<A, I, RD, RE>, functionName: string) =>
  new MongoError.CollectionErrorSource({
    module: "AggregationCursor",
    functionName,
    db: cursor.cursor.namespace.db,
    collection: cursor.cursor.namespace.collection ?? "NO_COLLECTION_NAME"
  })
