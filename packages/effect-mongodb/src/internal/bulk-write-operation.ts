import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Match from "effect/Match"
import type * as ParseResult from "effect/ParseResult"
import type { Document, Filter, UpdateFilter } from "mongodb"
import type { Collection } from "../Collection.js"

export type BulkWriteOperation<A extends Document, I extends Document> =
  | { readonly insertOne: { readonly document: A } }
  | {
    readonly replaceOne: {
      readonly filter: Filter<I>
      readonly replacement: A
      readonly upsert?: boolean
    }
  }
  | {
    readonly updateOne: {
      readonly filter: Filter<I>
      readonly update: UpdateFilter<I> | ReadonlyArray<Document>
      readonly upsert?: boolean
      readonly arrayFilters?: ReadonlyArray<Document>
      readonly collation?: Document
      readonly hint?: string | Document
    }
  }
  | {
    readonly updateMany: {
      readonly filter: Filter<I>
      readonly update: UpdateFilter<I> | ReadonlyArray<Document>
      readonly upsert?: boolean
      readonly arrayFilters?: ReadonlyArray<Document>
      readonly collation?: Document
      readonly hint?: string | Document
    }
  }
  | {
    readonly deleteOne: {
      readonly filter: Filter<I>
      readonly collation?: Document
      readonly hint?: string | Document
    }
  }
  | {
    readonly deleteMany: {
      readonly filter: Filter<I>
      readonly collation?: Document
      readonly hint?: string | Document
    }
  }

type BulkWriteOperationEncoded = BulkWriteOperation<Document, Document>

const encodeInsertOne = <A extends Document, I extends Document, R>(
  collection: Collection<A, I, R>,
  operation: { readonly insertOne: { readonly document: A } }
): Effect.Effect<{ readonly insertOne: { readonly document: I } }, ParseResult.ParseError, R> =>
  F.pipe(
    collection.encode(operation.insertOne.document),
    Effect.map((document) => ({ insertOne: { document } }))
  )

const encodeReplaceOne = <A extends Document, I extends Document, R>(
  collection: Collection<A, I, R>,
  operation: { readonly replaceOne: { readonly filter: Filter<I>; readonly replacement: A; readonly upsert?: boolean } }
): Effect.Effect<
  { readonly replaceOne: { readonly filter: Filter<I>; readonly replacement: I; readonly upsert?: boolean } },
  ParseResult.ParseError,
  R
> =>
  F.pipe(
    collection.encode(operation.replaceOne.replacement),
    Effect.map((replacement) => ({
      replaceOne: { ...operation.replaceOne, replacement }
    }))
  )

export const encodeBulkWriteOperation = <A extends Document, I extends Document, R>(
  collection: Collection<A, I, R>,
  operation: BulkWriteOperation<A, I>
): Effect.Effect<BulkWriteOperationEncoded, ParseResult.ParseError, R> =>
  F.pipe(
    Match.value(operation),
    Match.when(
      (op): op is { readonly insertOne: { readonly document: A } } => "insertOne" in op,
      (op) => encodeInsertOne(collection, op) as Effect.Effect<BulkWriteOperationEncoded, ParseResult.ParseError, R>
    ),
    Match.when(
      (
        op
      ): op is {
        readonly replaceOne: { readonly filter: Filter<I>; readonly replacement: A; readonly upsert?: boolean }
      } => "replaceOne" in op,
      (op) => encodeReplaceOne(collection, op) as Effect.Effect<BulkWriteOperationEncoded, ParseResult.ParseError, R>
    ),
    Match.orElse((op) => Effect.succeed(op as BulkWriteOperationEncoded))
  )
