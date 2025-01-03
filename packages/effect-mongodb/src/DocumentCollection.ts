/**
 * @since 0.0.1
 */
import * as Array from "effect/Array"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as O from "effect/Option"
import type * as Schema from "effect/Schema"
import type {
  AggregateOptions,
  BulkWriteOptions,
  Collection as MongoCollection,
  CountDocumentsOptions,
  CreateIndexesOptions,
  DeleteOptions,
  DeleteResult,
  Document,
  DropCollectionOptions,
  DropIndexesOptions,
  EstimatedDocumentCountOptions,
  Filter,
  FindOneAndReplaceOptions,
  FindOptions,
  IndexDescription,
  IndexSpecification,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  ModifyResult as MongoModifyResult,
  OptionalUnlessRequiredId,
  RenameOptions,
  ReplaceOptions,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
  WithoutId
} from "mongodb"
import * as Collection from "./Collection.js"
import * as DocumentAggregationCursor from "./DocumentAggregationCursor.js"
import * as DocumentFindCursor from "./DocumentFindCursor.js"
import type { ModifyResult } from "./internal/modify-result.js"
import * as MongoError from "./MongoError.js"

export class DocumentCollection extends Data.TaggedClass("DocumentCollection")<{
  collection: MongoCollection
}> {
}

export const find: {
  (
    filter?: Filter<Document>,
    options?: FindOptions
  ): (collection: DocumentCollection) => DocumentFindCursor.DocumentFindCursor
  (
    collection: DocumentCollection,
    filter?: Filter<Document>,
    options?: FindOptions
  ): DocumentFindCursor.DocumentFindCursor
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (collection: DocumentCollection, filter?: Filter<Document>, options?: FindOptions) =>
    new DocumentFindCursor.DocumentFindCursor(
      {
        cursor: collection.collection.find(filter ?? {}, options)
      }
    )
)

export const findOne: {
  (filter: Filter<Document>, options?: FindOptions): (
    collection: DocumentCollection
  ) => Effect.Effect<O.Option<Document>, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: FindOptions
  ): Effect.Effect<O.Option<Document>, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: FindOptions
  ): Effect.Effect<O.Option<Document>, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.findOne(filter, options)),
      Effect.map((value) => O.fromNullable(value)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<O.Option<Document>>("findOne error"))
    )
)

export const insertOne: {
  (doc: OptionalUnlessRequiredId<Document>, options?: InsertOneOptions): (
    collection: DocumentCollection
  ) => Effect.Effect<InsertOneResult, MongoError.MongoError>
  (
    collection: DocumentCollection,
    doc: OptionalUnlessRequiredId<Document>,
    options?: InsertOneOptions
  ): Effect.Effect<InsertOneResult, MongoError.MongoError>
} = F.dual((args) => isDocumentCollection(args[0]), (
  collection: DocumentCollection,
  doc: OptionalUnlessRequiredId<Document>,
  options?: InsertOneOptions
): Effect.Effect<InsertOneResult, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => collection.collection.insertOne(doc, options)),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertOneResult>("insertOne error"))
  ))

export const insertMany: {
  (
    docs: ReadonlyArray<OptionalUnlessRequiredId<Document>>,
    options?: BulkWriteOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<InsertOneResult, MongoError.MongoError>
  (
    collection: DocumentCollection,
    docs: ReadonlyArray<OptionalUnlessRequiredId<Document>>,
    options?: BulkWriteOptions
  ): Effect.Effect<InsertOneResult, MongoError.MongoError>
} = F.dual((args) => isDocumentCollection(args[0]), (
  collection: DocumentCollection,
  docs: ReadonlyArray<OptionalUnlessRequiredId<Document>>,
  options?: BulkWriteOptions
): Effect.Effect<InsertManyResult, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => collection.collection.insertMany(docs, options)),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertManyResult>("insertMany error"))
  ))

export const deleteOne: {
  (filter: Filter<Document>, options?: DeleteOptions): (
    collection: DocumentCollection
  ) => Effect.Effect<DeleteResult, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.deleteOne(filter, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<DeleteResult>("deleteOne error"))
    )
)

export const deleteMany: {
  (filter: Filter<Document>, options?: DeleteOptions): (
    collection: DocumentCollection
  ) => Effect.Effect<DeleteResult, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.deleteMany(filter, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<DeleteResult>("deleteMany error"))
    )
)

export const updateMany: {
  (
    filter: Filter<Document>,
    update: UpdateFilter<Document> | ReadonlyArray<Document>,
    options?: UpdateOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<UpdateResult, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    update: UpdateFilter<Document> | ReadonlyArray<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    update: UpdateFilter<Document> | ReadonlyArray<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() =>
        collection.collection.updateMany(filter, Array.isArray(update) ? [...update] : update, options)
      ),
      Effect.catchAllDefect(MongoError.mongoErrorDie<UpdateResult>("updateMany error"))
    )
)

export const replaceOne: {
  (
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options?: ReplaceOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<UpdateResult | Document, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options?: ReplaceOptions
  ): Effect.Effect<UpdateResult | Document, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options?: ReplaceOptions
  ): Effect.Effect<UpdateResult | Document, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.replaceOne(filter, replacement, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<UpdateResult | Document>("replaceOne error"))
    )
)

export const findOneAndReplace: {
  (
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true }
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<ModifyResult<Document>, MongoError.MongoError>
  (
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false }
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<O.Option<Document>, MongoError.MongoError>
  (
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options: FindOneAndReplaceOptions
  ): (
    collection: DocumentCollection
  ) => Effect.Effect<O.Option<Document>, MongoError.MongoError>
  (filter: Filter<Document>, replacement: WithoutId<Document>): (
    collection: DocumentCollection
  ) => Effect.Effect<O.Option<Document>, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true }
  ): Effect.Effect<ModifyResult<Document>, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false }
  ): Effect.Effect<O.Option<Document>, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options: FindOneAndReplaceOptions
  ): Effect.Effect<O.Option<Document>, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    replacement: WithoutId<Document>
  ): Effect.Effect<O.Option<Document>, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter: Filter<Document>,
    replacement: WithoutId<Document>,
    options?: FindOneAndReplaceOptions
  ): Effect.Effect<O.Option<Document> | ModifyResult<Document>, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.findOneAndReplace(filter, replacement, options ?? {})),
      Effect.map((value) => {
        if (options?.includeResultMetadata && !!value) {
          const result = value as unknown as MongoModifyResult<Document>
          return { ...result, value: O.fromNullable(result.value) }
        }
        return O.fromNullable(value)
      }),
      Effect.catchAllDefect(
        MongoError.mongoErrorDie<O.Option<Document> | ModifyResult<Document>>("findOneAndReplace error")
      )
    )
)

export const rename: {
  (newName: string, options?: RenameOptions): (
    collection: DocumentCollection
  ) => Effect.Effect<MongoCollection, MongoError.MongoError>
  (
    collection: DocumentCollection,
    newName: string,
    options?: RenameOptions
  ): Effect.Effect<MongoCollection, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    newName: string,
    options?: RenameOptions
  ): Effect.Effect<MongoCollection, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.rename(newName, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<MongoCollection>("rename error"))
    )
)

export const drop: {
  (options?: DropCollectionOptions): (collection: DocumentCollection) => Effect.Effect<boolean, MongoError.MongoError>
  (collection: DocumentCollection, options?: DropCollectionOptions): Effect.Effect<boolean, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    options?: DropCollectionOptions
  ): Effect.Effect<boolean, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.drop(options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<boolean>("drop error"))
    )
)

export const createIndexes: {
  (indexSpecs: ReadonlyArray<IndexDescription>, options?: CreateIndexesOptions): (
    collection: DocumentCollection
  ) => Effect.Effect<Array<string>, MongoError.MongoError>
  (
    collection: DocumentCollection,
    indexSpecs: ReadonlyArray<IndexDescription>,
    options?: CreateIndexesOptions
  ): Effect.Effect<Array<string>, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    indexSpecs: ReadonlyArray<IndexDescription>,
    options?: CreateIndexesOptions
  ): Effect.Effect<Array<string>, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.createIndexes([...indexSpecs], options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<Array<string>>("createIndexes error"))
    )
)

export const createIndex: {
  (
    indexSpec: IndexSpecification,
    options?: CreateIndexesOptions
  ): (collection: DocumentCollection) => Effect.Effect<string, MongoError.MongoError>
  (
    collection: DocumentCollection,
    indexSpec: IndexSpecification,
    options?: CreateIndexesOptions
  ): Effect.Effect<string, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    indexSpec: IndexSpecification,
    options?: CreateIndexesOptions
  ): Effect.Effect<string, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.createIndex(indexSpec, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<string>("createIndex error"))
    )
)

export const dropIndex: {
  (
    indexName: string,
    options?: DropIndexesOptions
  ): (collection: DocumentCollection) => Effect.Effect<Document, MongoError.MongoError>
  (
    collection: DocumentCollection,
    indexName: string,
    options?: DropIndexesOptions
  ): Effect.Effect<Document, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    indexName: string,
    options?: DropIndexesOptions
  ): Effect.Effect<Document, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.dropIndex(indexName, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<Document>("dropIndex error"))
    )
)

export const aggregate: {
  (pipeline?: ReadonlyArray<Document>, options?: AggregateOptions): (
    collection: DocumentCollection
  ) => DocumentAggregationCursor.DocumentAggregationCursor
  (
    collection: DocumentCollection,
    pipeline?: ReadonlyArray<Document>,
    options?: AggregateOptions
  ): DocumentAggregationCursor.DocumentAggregationCursor
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    pipeline?: ReadonlyArray<Document>,
    options?: AggregateOptions
  ): DocumentAggregationCursor.DocumentAggregationCursor =>
    new DocumentAggregationCursor.DocumentAggregationCursor({
      cursor: collection.collection.aggregate(pipeline ? [...pipeline] : undefined, options)
    })
)

export const estimatedDocumentCount: {
  (options?: EstimatedDocumentCountOptions): (
    collection: DocumentCollection
  ) => Effect.Effect<number, MongoError.MongoError>
  (
    collection: DocumentCollection,
    options?: EstimatedDocumentCountOptions
  ): Effect.Effect<number, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    options?: EstimatedDocumentCountOptions
  ): Effect.Effect<number, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.estimatedDocumentCount(options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<number>("estimatedDocumentCount error"))
    )
)

export const countDocuments: {
  (filter?: Filter<Document>, options?: CountDocumentsOptions): (
    collection: DocumentCollection
  ) => Effect.Effect<number, MongoError.MongoError>
  (
    collection: DocumentCollection,
    filter?: Filter<Document>,
    options?: CountDocumentsOptions
  ): Effect.Effect<number, MongoError.MongoError>
} = F.dual(
  (args) => isDocumentCollection(args[0]),
  (
    collection: DocumentCollection,
    filter?: Filter<Document>,
    options?: CountDocumentsOptions
  ): Effect.Effect<number, MongoError.MongoError> =>
    F.pipe(
      Effect.promise(() => collection.collection.countDocuments(filter, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<number>("countDocuments error"))
    )
)

export const typed: {
  <A extends Document, I extends Document = A, R = never>(
    schema: Schema.Schema<A, I, R>
  ): (collection: DocumentCollection) => Collection.Collection<A, I, R>
  <A extends Document, I extends Document = A, R = never>(
    collection: DocumentCollection,
    schema: Schema.Schema<A, I, R>
  ): Collection.Collection<A, I, R>
} = F.dual((args) => isDocumentCollection(args[0]), <A extends Document, I extends Document = A, R = never>(
  collection: DocumentCollection,
  schema: Schema.Schema<A, I, R>
): Collection.Collection<A, I, R> => new Collection.Collection<A, I, R>({ collection: collection.collection, schema }))

const isDocumentCollection = (x: unknown) => x instanceof DocumentCollection
