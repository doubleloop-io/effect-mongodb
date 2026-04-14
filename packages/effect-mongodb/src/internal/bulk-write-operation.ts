import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Match from "effect/Match"
import * as Schema from "effect/Schema"
import type {
  AnyBulkWriteOperation as MongoAnyBulkWriteOperation,
  DeleteManyModel as MongoDeleteManyModel,
  DeleteOneModel as MongoDeleteOneModel,
  Document,
  InsertOneModel as MongoInsertOneModel,
  ReplaceOneModel as MongoReplaceOneModel,
  UpdateManyModel as MongoUpdateManyModel,
  UpdateOneModel as MongoUpdateOneModel
} from "mongodb"
import type { Filter } from "./filter.js"

type InsertOneModel<A extends Document> = {
  readonly insertOne: {
    document: A
  }
}
type ReplaceOneModel<A extends Document, I extends Document> = {
  readonly replaceOne: Omit<MongoReplaceOneModel, "replacement" | "filter"> & {
    filter: Filter<I>
    replacement: A
  }
}
type UpdateOneModel<I extends Document> = { readonly updateOne: MongoUpdateOneModel<I> }
type UpdateManyModel<I extends Document> = { readonly updateMany: MongoUpdateManyModel<I> }
type DeleteOneModel<I extends Document> = { readonly deleteOne: MongoDeleteOneModel<I> }
type DeleteManyModel<I extends Document> = { readonly deleteMany: MongoDeleteManyModel<I> }

export type AnyBulkWriteOperation<A extends Document, I extends Document> =
  | InsertOneModel<A>
  | ReplaceOneModel<A, I>
  | UpdateOneModel<I>
  | UpdateManyModel<I>
  | DeleteOneModel<I>
  | DeleteManyModel<I>

export const encodeBulkWriteOperation = <A extends Document, I extends Document, R>(
  schema: Schema.Schema<A, I, R>,
  operation: AnyBulkWriteOperation<A, I>
) =>
  F.pipe(
    Match.value(operation),
    Match.when(
      (op): op is InsertOneModel<A> => "insertOne" in op,
      (op) => encodeInsertOne(schema, op)
    ),
    Match.when(
      (op): op is ReplaceOneModel<A, I> => "replaceOne" in op,
      (op) => encodeReplaceOne(schema, op)
    ),
    Match.when(
      (op): op is UpdateOneModel<I> => "updateOne" in op,
      (op) => Effect.succeed(op)
    ),
    Match.when(
      (op): op is UpdateManyModel<I> => "updateMany" in op,
      (op) => Effect.succeed(op)
    ),
    Match.when(
      (op): op is DeleteOneModel<I> => "deleteOne" in op,
      (op) => Effect.succeed(op)
    ),
    Match.when(
      (op): op is DeleteManyModel<I> => "deleteMany" in op,
      (op) => Effect.succeed(op)
    ),
    Match.exhaustive,
    Effect.map((x) => x as MongoAnyBulkWriteOperation<Document>)
  )

const encodeInsertOne = <A extends Document, I extends Document, R>(
  schema: Schema.Schema<A, I, R>,
  operation: InsertOneModel<A>
) =>
  F.pipe(
    operation.insertOne.document,
    Schema.encode(schema),
    Effect.map((document) => ({ insertOne: { document } as MongoInsertOneModel<I> }))
  )

const encodeReplaceOne = <A extends Document, I extends Document, R>(
  schema: Schema.Schema<A, I, R>,
  operation: ReplaceOneModel<A, I>
) =>
  F.pipe(
    operation.replaceOne.replacement,
    Schema.encode(schema),
    Effect.map((replacement) => ({
      replaceOne: { ...operation.replaceOne, replacement }
    }))
  )
