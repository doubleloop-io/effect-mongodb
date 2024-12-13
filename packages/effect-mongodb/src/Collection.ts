/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type * as O from "effect/Option"
import type * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"
import type { Simplify } from "effect/Schema"
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
  FindOneAndReplaceOptions,
  FindOptions as MongoFindOptions,
  IndexDescription,
  IndexSpecification,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  ModifyResult as MongoModifyResult,
  RenameOptions,
  ReplaceOptions,
  UpdateFilter,
  UpdateOptions,
  UpdateResult
} from "mongodb"
import * as AggregationCursor from "./AggregationCursor.js"
import * as FindCursor from "./FindCursor.js"
import type * as DocumentSchema from "./internal/document-schema.js"
import type { Filter as GenericFilter } from "./internal/filter.js"
import type { ModifyResult } from "./internal/modify-result.js"
import * as SchemaExt from "./internal/schema.js"
import * as MongoError from "./MongoError.js"

export class Collection<TSchema extends DocumentSchema.Any> extends Data.TaggedClass("Collection")<{
  collection: MongoCollection
  schema: TSchema
}> {
  get basicSchema(): DocumentSchema.BasicSchema<TSchema> {
    return this.schema as any
  }
}

export type FindOptions = Omit<MongoFindOptions, "projection">
type Filter<TSchema extends DocumentSchema.Any> = GenericFilter<DocumentSchema.Encoded<TSchema>>

export const find: {
  <TSchema extends DocumentSchema.Any>(
    filter?: Filter<TSchema>,
    options?: FindOptions
  ): (collection: Collection<TSchema>) => FindCursor.FindCursorFromSchema<TSchema>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter?: Filter<TSchema>,
    options?: FindOptions
  ): FindCursor.FindCursorFromSchema<TSchema>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter?: Filter<TSchema>,
    options?: FindOptions
  ): FindCursor.FindCursorFromSchema<TSchema> =>
    new FindCursor.FindCursor(
      {
        cursor: collection.collection.find(filter ?? {}, options),
        schema: collection.basicSchema
      }
    )
)

export const findOne: {
  <TSchema extends DocumentSchema.Any>(filter: Filter<TSchema>, options?: FindOptions): (
    collection: Collection<TSchema>
  ) => Effect.Effect<
    O.Option<DocumentSchema.Type<TSchema>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    options?: FindOptions
  ): Effect.Effect<
    O.Option<DocumentSchema.Type<TSchema>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    options?: FindOptions
  ): Effect.Effect<
    O.Option<Simplify<DocumentSchema.Type<TSchema>>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  > =>
    Effect.gen(function*(_) {
      const value = yield* _(Effect.promise(() => collection.collection.findOne(filter, options)))
      return yield* _(SchemaExt.decodeNullableDocument(collection.basicSchema, value))
    }).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<O.Option<DocumentSchema.Type<TSchema>>>("findOne error"))
    )
)

export const insertOne: {
  <TSchema extends DocumentSchema.Any>(
    doc: DocumentSchema.Type<TSchema>,
    options?: InsertOneOptions
  ): (
    collection: Collection<TSchema>
  ) => Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    doc: DocumentSchema.Type<TSchema>,
    options?: InsertOneOptions
  ): Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, DocumentSchema.Context<TSchema>>
} = F.dual((args) => isCollection(args[0]), <TSchema extends DocumentSchema.Any>(
  collection: Collection<TSchema>,
  doc: DocumentSchema.Type<TSchema>,
  options?: InsertOneOptions
): Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, DocumentSchema.Context<TSchema>> =>
  F.pipe(
    Schema.encode(collection.basicSchema)(doc),
    Effect.flatMap((doc) => Effect.promise(() => collection.collection.insertOne(doc, options))),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertOneResult>("insertOne error"))
  ))

export const insertMany: {
  <TSchema extends DocumentSchema.Any>(docs: Array<DocumentSchema.Type<TSchema>>, options?: BulkWriteOptions): (
    collection: Collection<TSchema>
  ) => Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    docs: Array<DocumentSchema.Type<TSchema>>,
    options?: BulkWriteOptions
  ): Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, DocumentSchema.Context<TSchema>>
} = F.dual((args) => isCollection(args[0]), <TSchema extends DocumentSchema.Any>(
  collection: Collection<TSchema>,
  docs: Array<DocumentSchema.Type<TSchema>>,
  options?: BulkWriteOptions
): Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, DocumentSchema.Context<TSchema>> => {
  const encode = Schema.encode(collection.basicSchema)
  return F.pipe(
    docs,
    Effect.forEach((doc) => encode(doc)),
    Effect.flatMap((docs) => Effect.promise(() => collection.collection.insertMany(docs, options))),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertManyResult>("insertMany error"))
  )
})

export const deleteOne: {
  <TSchema extends DocumentSchema.Any>(filter: Filter<TSchema>, options?: DeleteOptions): (
    collection: Collection<TSchema>
  ) => Effect.Effect<DeleteResult, MongoError.MongoError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, DocumentSchema.Context<TSchema>>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, DocumentSchema.Context<TSchema>> =>
    Effect.promise(() => collection.collection.deleteOne(filter, options)).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<DeleteResult>("deleteOne error"))
    )
)

export const deleteMany: {
  <TSchema extends DocumentSchema.Any>(filter: Filter<TSchema>, options?: DeleteOptions): (
    collection: Collection<TSchema>
  ) => Effect.Effect<DeleteResult, MongoError.MongoError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, DocumentSchema.Context<TSchema>>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, DocumentSchema.Context<TSchema>> =>
    Effect.promise(() => collection.collection.deleteMany(filter, options)).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<DeleteResult>("deleteMany error"))
    )
)

export const updateMany: {
  <TSchema extends DocumentSchema.Any>(
    filter: Filter<TSchema>,
    update: UpdateFilter<DocumentSchema.Encoded<TSchema>> | Array<Document>,
    options?: UpdateOptions
  ): (
    collection: Collection<TSchema>
  ) => Effect.Effect<UpdateResult, MongoError.MongoError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    update: UpdateFilter<DocumentSchema.Encoded<TSchema>> | Array<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult, MongoError.MongoError, DocumentSchema.Context<TSchema>>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    update: UpdateFilter<DocumentSchema.Encoded<TSchema>> | Array<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult, MongoError.MongoError, DocumentSchema.Context<TSchema>> =>
    Effect.promise(() =>
      collection.collection.updateMany(filter, update as UpdateFilter<Document> | Array<Document>, options)
    ).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<UpdateResult>("updateMany error"))
    )
)

export const replaceOne: {
  <TSchema extends DocumentSchema.Any>(
    filter: Filter<TSchema>,
    // TODO: should we put WithoutId<A> here like the driver signature?
    replacement: DocumentSchema.Type<TSchema>,
    options?: ReplaceOptions
  ): (
    collection: Collection<TSchema>
  ) => Effect.Effect<
    UpdateResult | Document,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    replacement: DocumentSchema.Type<TSchema>,
    options?: ReplaceOptions
  ): Effect.Effect<
    UpdateResult | Document,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    replacement: DocumentSchema.Type<TSchema>,
    options?: ReplaceOptions
  ): Effect.Effect<
    UpdateResult | Document,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  > =>
    F.pipe(
      // TODO: extract function in Collection
      Schema.encode(collection.basicSchema)(replacement),
      Effect.flatMap((replacement) =>
        Effect.promise(() => collection.collection.replaceOne(filter, replacement, options))
      ),
      Effect.catchAllDefect(MongoError.mongoErrorDie<UpdateResult | Document>("replaceOne error"))
    )
)

export const findOneAndReplace: {
  <TSchema extends DocumentSchema.Any>(
    filter: Filter<TSchema>,
    replacement: DocumentSchema.Type<TSchema>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true }
  ): (
    collection: Collection<TSchema>
  ) => Effect.Effect<
    ModifyResult<DocumentSchema.Type<TSchema>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
  <TSchema extends DocumentSchema.Any>(
    filter: Filter<TSchema>,
    replacement: DocumentSchema.Type<TSchema>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false }
  ): (
    collection: Collection<TSchema>
  ) => Effect.Effect<
    O.Option<DocumentSchema.Type<TSchema>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
  <TSchema extends DocumentSchema.Any>(
    filter: Filter<TSchema>,
    replacement: DocumentSchema.Type<TSchema>,
    options: FindOneAndReplaceOptions
  ): (
    collection: Collection<TSchema>
  ) => Effect.Effect<
    O.Option<DocumentSchema.Type<TSchema>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
  <TSchema extends DocumentSchema.Any>(filter: Filter<TSchema>, replacement: DocumentSchema.Type<TSchema>): (
    collection: Collection<TSchema>
  ) => Effect.Effect<
    O.Option<DocumentSchema.Type<TSchema>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    replacement: DocumentSchema.Type<TSchema>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true }
  ): Effect.Effect<
    ModifyResult<DocumentSchema.Type<TSchema>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    replacement: DocumentSchema.Type<TSchema>,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false }
  ): Effect.Effect<
    O.Option<DocumentSchema.Type<TSchema>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    replacement: DocumentSchema.Type<TSchema>,
    options: FindOneAndReplaceOptions
  ): Effect.Effect<
    O.Option<DocumentSchema.Type<TSchema>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    replacement: DocumentSchema.Type<TSchema>
  ): Effect.Effect<
    O.Option<DocumentSchema.Type<TSchema>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  >
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter: Filter<TSchema>,
    replacement: DocumentSchema.Type<TSchema>,
    options?: FindOneAndReplaceOptions
  ): Effect.Effect<
    O.Option<Simplify<DocumentSchema.Type<TSchema>>> | ModifyResult<Simplify<DocumentSchema.Type<TSchema>>>,
    MongoError.MongoError | ParseResult.ParseError,
    DocumentSchema.Context<TSchema>
  > =>
    F.pipe(
      // TODO: extract function in Collection
      Schema.encode(collection.basicSchema)(replacement),
      Effect.flatMap((replacement) =>
        Effect.promise(() => collection.collection.findOneAndReplace(filter, replacement, options ?? {}))
      ),
      Effect.flatMap((value) =>
        Effect.gen(function*(_) {
          if (options?.includeResultMetadata && !!value) {
            const result = value as unknown as MongoModifyResult<DocumentSchema.Encoded<TSchema>>
            const maybeValue = yield* _(SchemaExt.decodeNullableDocument(collection.basicSchema, result.value))
            return { ...result, value: maybeValue }
          }
          return yield* _(SchemaExt.decodeNullableDocument(collection.basicSchema, value))
        })
      ),
      Effect.catchAllDefect(
        MongoError.mongoErrorDie<O.Option<DocumentSchema.Type<TSchema>> | ModifyResult<DocumentSchema.Type<TSchema>>>(
          "findOneAndReplace error"
        )
      )
    )
)

export const rename: {
  (newName: string, options?: RenameOptions): <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>
  ) => Effect.Effect<Collection<TSchema>, MongoError.MongoError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    newName: string,
    options?: RenameOptions
  ): Effect.Effect<Collection<TSchema>, MongoError.MongoError, DocumentSchema.Context<TSchema>>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    newName: string,
    options?: RenameOptions
  ): Effect.Effect<Collection<TSchema>, MongoError.MongoError, DocumentSchema.Context<TSchema>> =>
    F.pipe(
      Effect.promise(() => collection.collection.rename(newName, options)),
      Effect.map((newCollection) => new Collection<TSchema>({ collection: newCollection, schema: collection.schema })),
      Effect.catchAllDefect(MongoError.mongoErrorDie<Collection<TSchema>>("rename error"))
    )
)

export const drop: {
  (options?: DropCollectionOptions): <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>
  ) => Effect.Effect<boolean, MongoError.MongoError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    options?: DropCollectionOptions
  ): Effect.Effect<boolean, MongoError.MongoError, DocumentSchema.Context<TSchema>>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    options?: DropCollectionOptions
  ): Effect.Effect<boolean, MongoError.MongoError, DocumentSchema.Context<TSchema>> =>
    F.pipe(
      Effect.promise(() => collection.collection.drop(options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<boolean>("drop error"))
    )
)

export const createIndexes: {
  (indexSpecs: Array<IndexDescription>, options?: CreateIndexesOptions): <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>
  ) => Effect.Effect<Array<string>, MongoError.MongoError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    indexSpecs: Array<IndexDescription>,
    options?: CreateIndexesOptions
  ): Effect.Effect<Array<string>, MongoError.MongoError, DocumentSchema.Context<TSchema>>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    indexSpecs: Array<IndexDescription>,
    options?: CreateIndexesOptions
  ): Effect.Effect<Array<string>, MongoError.MongoError, DocumentSchema.Context<TSchema>> =>
    F.pipe(
      Effect.promise(() => collection.collection.createIndexes(indexSpecs, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<Array<string>>("createIndexes error"))
    )
)

export const createIndex: {
  (indexSpec: IndexSpecification, options?: CreateIndexesOptions): <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>
  ) => Effect.Effect<string, MongoError.MongoError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    indexSpec: IndexSpecification,
    options?: CreateIndexesOptions
  ): Effect.Effect<string, MongoError.MongoError, DocumentSchema.Context<TSchema>>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    indexSpec: IndexSpecification,
    options?: CreateIndexesOptions
  ): Effect.Effect<string, MongoError.MongoError, DocumentSchema.Context<TSchema>> =>
    F.pipe(
      Effect.promise(() => collection.collection.createIndex(indexSpec, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<string>("createIndex error"))
    )
)

// TODO: review return type. Should we return Document like mongodb driver?
export const dropIndex: {
  (indexName: string, options?: DropIndexesOptions): <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>
  ) => Effect.Effect<void, MongoError.MongoError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    indexName: string,
    options?: DropIndexesOptions
  ): Effect.Effect<void, MongoError.MongoError, DocumentSchema.Context<TSchema>>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    indexName: string,
    options?: DropIndexesOptions
  ): Effect.Effect<void, MongoError.MongoError, DocumentSchema.Context<TSchema>> =>
    F.pipe(
      Effect.promise(() => collection.collection.dropIndex(indexName, options)),
      Effect.asVoid,
      Effect.catchAllDefect(MongoError.mongoErrorDie<void>("dropIndex error"))
    )
)

export const aggregate: {
  <TSchemaB extends DocumentSchema.Any>(
    pipeline: Array<Document>,
    schema: TSchemaB,
    options?: AggregateOptions
  ): <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>
  ) => AggregationCursor.AggregationCursor<
    Simplify<DocumentSchema.Type<TSchemaB>>,
    Simplify<DocumentSchema.Encoded<TSchemaB>>,
    DocumentSchema.Context<TSchemaB>
  >
  <TSchema extends DocumentSchema.Any, TSchemaB extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    pipeline: Array<Document>,
    schema: TSchemaB,
    options?: AggregateOptions
  ): AggregationCursor.AggregationCursor<
    Simplify<DocumentSchema.Type<TSchemaB>>,
    Simplify<DocumentSchema.Encoded<TSchemaB>>,
    DocumentSchema.Context<TSchemaB>
  >
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any, TSchemaB extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    pipeline: Array<Document>,
    schema: TSchemaB,
    options?: AggregateOptions
  ): AggregationCursor.AggregationCursor<
    Simplify<DocumentSchema.Type<TSchemaB>>,
    Simplify<DocumentSchema.Encoded<TSchemaB>>,
    DocumentSchema.Context<TSchemaB>
  > =>
    new AggregationCursor.AggregationCursor({
      cursor: collection.collection.aggregate(pipeline, options),
      schema: schema as any
    })
)

export const estimatedDocumentCount: {
  (options?: EstimatedDocumentCountOptions): <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>
  ) => Effect.Effect<number, MongoError.MongoError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    options?: EstimatedDocumentCountOptions
  ): Effect.Effect<number, MongoError.MongoError, DocumentSchema.Context<TSchema>>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    options?: EstimatedDocumentCountOptions
  ): Effect.Effect<number, MongoError.MongoError, DocumentSchema.Context<TSchema>> =>
    F.pipe(
      Effect.promise(() => collection.collection.estimatedDocumentCount(options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<number>("estimatedDocumentCount error"))
    )
)

export const countDocuments: {
  <TSchema extends DocumentSchema.Any>(filter?: Filter<TSchema>, options?: CountDocumentsOptions): (
    collection: Collection<TSchema>
  ) => Effect.Effect<number, MongoError.MongoError, DocumentSchema.Context<TSchema>>
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter?: Filter<TSchema>,
    options?: CountDocumentsOptions
  ): Effect.Effect<number, MongoError.MongoError, DocumentSchema.Context<TSchema>>
} = F.dual(
  (args) => isCollection(args[0]),
  <TSchema extends DocumentSchema.Any>(
    collection: Collection<TSchema>,
    filter?: Filter<TSchema>,
    options?: CountDocumentsOptions
  ): Effect.Effect<number, MongoError.MongoError, DocumentSchema.Context<TSchema>> =>
    F.pipe(
      Effect.promise(() => collection.collection.countDocuments(filter, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<number>("countDocuments error"))
    )
)

const isCollection = (x: unknown) => x instanceof Collection
