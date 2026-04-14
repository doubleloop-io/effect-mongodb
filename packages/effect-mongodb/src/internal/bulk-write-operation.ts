import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Match from "effect/Match"
import type * as ParseResult from "effect/ParseResult"
import type { AnyBulkWriteOperation, Document, InsertOneModel, ReplaceOneModel } from "mongodb"
import type { Collection } from "../Collection.js"

export const encodeBulkWriteOperation = <A extends Document, I extends Document, R>(
  collection: Collection<A, I, R>,
  operation: AnyBulkWriteOperation<A>
): Effect.Effect<AnyBulkWriteOperation<I>, ParseResult.ParseError, R> =>
  F.pipe(
    Match.value(operation),
    Match.when((op): op is { insertOne: InsertOneModel<A> } => "insertOne" in op, (op) =>
      F.pipe(
        collection.encode(op.insertOne.document as A),
        Effect.map((document) => ({ insertOne: { document } }))
      )),
    Match.when((op): op is { replaceOne: ReplaceOneModel<A> } => "replaceOne" in op, (op) =>
      F.pipe(
        collection.encode(op.replaceOne.replacement as A),
        Effect.map((replacement) => ({
          replaceOne: { ...op.replaceOne, replacement }
        }))
      )),
    Match.orElse((op) => Effect.succeed(op))
  ) as Effect.Effect<AnyBulkWriteOperation<I>, ParseResult.ParseError, R>
