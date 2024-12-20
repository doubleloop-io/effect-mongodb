/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type * as O from "effect/Option"
import type * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"
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
import type { Filter } from "./internal/filter.js"
import type { ModifyResult } from "./internal/modify-result.js"
import * as SchemaExt from "./internal/schema.js"
import * as MongoError from "./MongoError.js"

export class Collection<A extends Document, I extends Document = A, R = never> extends Data.TaggedClass("Collection")<{
  collection: MongoCollection
  schema: Schema.Schema<A, I, R>
}> {
}

export type FindOptions = Omit<MongoFindOptions, "projection">

export const find: {
  <I extends Document>(
    filter?: Filter<I>,
    options?: FindOptions
  ): <A extends Document, R>(collection: Collection<A, I, R>) => FindCursor.FindCursor<A, I, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter?: Filter<I>,
    options?: FindOptions
  ): FindCursor.FindCursor<A, I, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter?: Filter<I>,
    options?: FindOptions
  ): FindCursor.FindCursor<A, I, R> =>
    new FindCursor.FindCursor<A, I, R>({
      cursor: collection.collection.find(filter ?? {}, options),
      schema: collection.schema
    })
)

export const findOne: {
  <I extends Document>(filter: Filter<I>, options?: FindOptions): <A extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: FindOptions
  ): Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: FindOptions
  ): Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R> =>
    Effect.gen(function*(_) {
      const value = yield* _(Effect.promise(() => collection.collection.findOne(filter, options)))
      return yield* _(SchemaExt.decodeNullableDocument(collection.schema, value))
    }).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<O.Option<A>>("findOne error"))
    )
)

export const insertOne: {
  <A extends Document>(doc: A, options?: InsertOneOptions): <I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    doc: A,
    options?: InsertOneOptions
  ): Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual((args) => isCollection(args[0]), <A extends Document, I extends Document, R>(
  collection: Collection<A, I, R>,
  doc: A,
  options?: InsertOneOptions
): Effect.Effect<InsertOneResult, MongoError.MongoError | ParseResult.ParseError, R> =>
  F.pipe(
    Schema.encode(collection.schema)(doc),
    Effect.flatMap((doc) => Effect.promise(() => collection.collection.insertOne(doc, options))),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertOneResult>("insertOne error"))
  ))

export const insertMany: {
  <A extends Document>(docs: Array<A>, options?: BulkWriteOptions): <I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    docs: Array<A>,
    options?: BulkWriteOptions
  ): Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual((args) => isCollection(args[0]), <A extends Document, I extends Document, R>(
  collection: Collection<A, I, R>,
  docs: Array<A>,
  options?: BulkWriteOptions
): Effect.Effect<InsertManyResult, MongoError.MongoError | ParseResult.ParseError, R> => {
  const encode = Schema.encode(collection.schema)
  return F.pipe(
    docs,
    Effect.forEach((doc) => encode(doc)),
    Effect.flatMap((docs) => Effect.promise(() => collection.collection.insertMany(docs, options))),
    Effect.catchAllDefect(MongoError.mongoErrorDie<InsertManyResult>("insertMany error"))
  )
})

export const deleteOne: {
  <I extends Document>(filter: Filter<I>, options?: DeleteOptions): <A extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<DeleteResult, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, R> =>
    Effect.promise(() => collection.collection.deleteOne(filter, options)).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<DeleteResult>("deleteOne error"))
    )
)

export const deleteMany: {
  <I extends Document>(filter: Filter<I>, options?: DeleteOptions): <A extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<DeleteResult, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    options?: DeleteOptions
  ): Effect.Effect<DeleteResult, MongoError.MongoError, R> =>
    Effect.promise(() => collection.collection.deleteMany(filter, options)).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<DeleteResult>("deleteMany error"))
    )
)

export const updateMany: {
  <I extends Document>(
    filter: Filter<I>,
    update: UpdateFilter<I> | Array<Document>,
    options?: UpdateOptions
  ): <A extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<UpdateResult, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    update: UpdateFilter<I> | Array<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    update: UpdateFilter<I> | Array<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult, MongoError.MongoError, R> =>
    Effect.promise(() =>
      collection.collection.updateMany(filter, update as UpdateFilter<Document> | Array<Document>, options)
    ).pipe(
      Effect.catchAllDefect(MongoError.mongoErrorDie<UpdateResult>("updateMany error"))
    )
)

export const replaceOne: {
  <A extends Document, I extends Document>(
    filter: Filter<I>,
    // TODO: should we put WithoutId<A> here like the driver signature?
    replacement: A,
    options?: ReplaceOptions
  ): <R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<UpdateResult | Document, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A,
    options?: ReplaceOptions
  ): Effect.Effect<UpdateResult | Document, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A,
    options?: ReplaceOptions
  ): Effect.Effect<
    UpdateResult | Document,
    MongoError.MongoError | ParseResult.ParseError,
    R
  > =>
    F.pipe(
      // TODO: extract function in Collection
      Schema.encode(collection.schema)(replacement),
      Effect.flatMap((replacement) =>
        Effect.promise(() => collection.collection.replaceOne(filter, replacement, options))
      ),
      Effect.catchAllDefect(MongoError.mongoErrorDie<UpdateResult | Document>("replaceOne error"))
    )
)

export const findOneAndReplace: {
  <A extends Document, I extends Document>(
    filter: Filter<I>,
    replacement: A,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true }
  ): <R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<ModifyResult<A>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document>(
    filter: Filter<I>,
    replacement: A,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false }
  ): <R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document>(filter: Filter<I>, replacement: A, options: FindOneAndReplaceOptions): <R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document>(filter: Filter<I>, replacement: A): <R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A,
    options: FindOneAndReplaceOptions & { includeResultMetadata: true }
  ): Effect.Effect<ModifyResult<A>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A,
    options: FindOneAndReplaceOptions & { includeResultMetadata: false }
  ): Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A,
    options: FindOneAndReplaceOptions
  ): Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A
  ): Effect.Effect<O.Option<A>, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A,
    options?: FindOneAndReplaceOptions
  ): Effect.Effect<O.Option<A> | ModifyResult<A>, MongoError.MongoError | ParseResult.ParseError, R> =>
    F.pipe(
      // TODO: extract function in Collection
      Schema.encode(collection.schema)(replacement),
      Effect.flatMap((replacement) =>
        Effect.promise(() => collection.collection.findOneAndReplace(filter, replacement, options ?? {}))
      ),
      Effect.flatMap((value) =>
        Effect.gen(function*(_) {
          if (options?.includeResultMetadata && !!value) {
            const result = value as unknown as MongoModifyResult<I>
            const maybeValue = yield* _(SchemaExt.decodeNullableDocument(collection.schema, result.value))
            return { ...result, value: maybeValue }
          }
          return yield* _(SchemaExt.decodeNullableDocument(collection.schema, value))
        })
      ),
      Effect.catchAllDefect(
        MongoError.mongoErrorDie<O.Option<A> | ModifyResult<A>>("findOneAndReplace error")
      )
    )
)

export const rename: {
  (newName: string, options?: RenameOptions): <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<Collection<A, I, R>, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    newName: string,
    options?: RenameOptions
  ): Effect.Effect<Collection<A, I, R>, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    newName: string,
    options?: RenameOptions
  ): Effect.Effect<Collection<A, I, R>, MongoError.MongoError, R> =>
    F.pipe(
      Effect.promise(() => collection.collection.rename(newName, options)),
      Effect.map((newCollection) => new Collection<A, I, R>({ collection: newCollection, schema: collection.schema })),
      Effect.catchAllDefect(MongoError.mongoErrorDie<Collection<A, I, R>>("rename error"))
    )
)

export const drop: {
  (options?: DropCollectionOptions): <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<boolean, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    options?: DropCollectionOptions
  ): Effect.Effect<boolean, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    options?: DropCollectionOptions
  ): Effect.Effect<boolean, MongoError.MongoError, R> =>
    F.pipe(
      Effect.promise(() => collection.collection.drop(options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<boolean>("drop error"))
    )
)

export const createIndexes: {
  (indexSpecs: Array<IndexDescription>, options?: CreateIndexesOptions): <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<Array<string>, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    indexSpecs: Array<IndexDescription>,
    options?: CreateIndexesOptions
  ): Effect.Effect<Array<string>, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    indexSpecs: Array<IndexDescription>,
    options?: CreateIndexesOptions
  ): Effect.Effect<Array<string>, MongoError.MongoError, R> =>
    F.pipe(
      Effect.promise(() => collection.collection.createIndexes(indexSpecs, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<Array<string>>("createIndexes error"))
    )
)

export const createIndex: {
  (indexSpec: IndexSpecification, options?: CreateIndexesOptions): <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<string, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    indexSpec: IndexSpecification,
    options?: CreateIndexesOptions
  ): Effect.Effect<string, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    indexSpec: IndexSpecification,
    options?: CreateIndexesOptions
  ): Effect.Effect<string, MongoError.MongoError, R> =>
    F.pipe(
      Effect.promise(() => collection.collection.createIndex(indexSpec, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<string>("createIndex error"))
    )
)

// TODO: review return type. Should we return Document like mongodb driver?
export const dropIndex: {
  (indexName: string, options?: DropIndexesOptions): <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<void, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    indexName: string,
    options?: DropIndexesOptions
  ): Effect.Effect<void, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    indexName: string,
    options?: DropIndexesOptions
  ): Effect.Effect<void, MongoError.MongoError, R> =>
    F.pipe(
      Effect.promise(() => collection.collection.dropIndex(indexName, options)),
      Effect.asVoid,
      Effect.catchAllDefect(MongoError.mongoErrorDie<void>("dropIndex error"))
    )
)

export const aggregate: {
  <B extends Document, BI extends Document, BR>(
    pipeline: Array<Document>,
    schema: Schema.Schema<B, BI, BR>,
    options?: AggregateOptions
  ): <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>
  ) => AggregationCursor.AggregationCursor<B, BI, BR>
  <A extends Document, I extends Document, R, B extends Document, BI extends Document, BR>(
    collection: Collection<A, I, R>,
    pipeline: Array<Document>,
    schema: Schema.Schema<B, BI, BR>,
    options?: AggregateOptions
  ): AggregationCursor.AggregationCursor<B, BI, BR>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R, B extends Document, BI extends Document, BR>(
    collection: Collection<A, I, R>,
    pipeline: Array<Document>,
    schema: Schema.Schema<B, BI, BR>,
    options?: AggregateOptions
  ): AggregationCursor.AggregationCursor<B, BI, BR> =>
    new AggregationCursor.AggregationCursor<B, BI, BR>({
      cursor: collection.collection.aggregate(pipeline, options),
      schema
    })
)

export const estimatedDocumentCount: {
  (options?: EstimatedDocumentCountOptions): <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<number, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    options?: EstimatedDocumentCountOptions
  ): Effect.Effect<number, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    options?: EstimatedDocumentCountOptions
  ): Effect.Effect<number, MongoError.MongoError, R> =>
    F.pipe(
      Effect.promise(() => collection.collection.estimatedDocumentCount(options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<number>("estimatedDocumentCount error"))
    )
)

export const countDocuments: {
  <I extends Document>(filter?: Filter<I>, options?: CountDocumentsOptions): <A extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<number, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter?: Filter<I>,
    options?: CountDocumentsOptions
  ): Effect.Effect<number, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter?: Filter<I>,
    options?: CountDocumentsOptions
  ): Effect.Effect<number, MongoError.MongoError, R> =>
    F.pipe(
      Effect.promise(() => collection.collection.countDocuments(filter, options)),
      Effect.catchAllDefect(MongoError.mongoErrorDie<number>("countDocuments error"))
    )
)

const isCollection = (x: unknown) => x instanceof Collection
