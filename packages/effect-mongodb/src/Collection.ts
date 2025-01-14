/**
 * @since 0.0.1
 */
import * as Array from "effect/Array"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import type * as O from "effect/Option"
import type * as ParseResult from "effect/ParseResult"
import type { Pipeable } from "effect/Pipeable"
import { pipeArguments } from "effect/Pipeable"
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
import { mongoErrorOrDie } from "./internal/mongo-error.js"
import * as SchemaExt from "./internal/schema.js"
import * as MongoError from "./MongoError.js"

export class Collection<A extends Document, I extends Document = A, R = never> extends Data.TaggedClass("Collection")<{
  collection: MongoCollection
  schema: Schema.Schema<A, I, R>
}> implements Pipeable {
  readonly encode = Schema.encode(this.schema)
  pipe() {
    return pipeArguments(this, arguments)
  }
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
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "findOne")))
    )
)

export const insertOne: {
  <A extends Document>(doc: A, options?: InsertOneOptions): <I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<InsertOneResult<I>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    doc: A,
    options?: InsertOneOptions
  ): Effect.Effect<InsertOneResult<I>, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual((args) => isCollection(args[0]), <A extends Document, I extends Document, R>(
  collection: Collection<A, I, R>,
  doc: A,
  options?: InsertOneOptions
): Effect.Effect<InsertOneResult<I>, MongoError.MongoError | ParseResult.ParseError, R> =>
  F.pipe(
    collection.encode(doc),
    Effect.flatMap((doc) => Effect.promise(() => collection.collection.insertOne(doc, options))),
    Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "insertOne")))
  ))

export const insertMany: {
  <A extends Document>(docs: ReadonlyArray<A>, options?: BulkWriteOptions): <I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<InsertManyResult<I>, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    docs: ReadonlyArray<A>,
    options?: BulkWriteOptions
  ): Effect.Effect<InsertManyResult<I>, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual((args) => isCollection(args[0]), <A extends Document, I extends Document, R>(
  collection: Collection<A, I, R>,
  docs: ReadonlyArray<A>,
  options?: BulkWriteOptions
): Effect.Effect<InsertManyResult<I>, MongoError.MongoError | ParseResult.ParseError, R> => {
  return F.pipe(
    docs,
    Effect.forEach((doc) => collection.encode(doc)),
    Effect.flatMap((docs) => Effect.promise(() => collection.collection.insertMany(docs, options))),
    Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "insertMany")))
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
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "deleteOne")))
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
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "deleteMany")))
    )
)

export const updateMany: {
  <I extends Document>(
    filter: Filter<I>,
    update: UpdateFilter<I> | ReadonlyArray<Document>,
    options?: UpdateOptions
  ): <A extends Document, I2 extends I, R>(
    collection: Collection<A, I2, R>
  ) => Effect.Effect<UpdateResult<I2>, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    update: UpdateFilter<I> | ReadonlyArray<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult<I>, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    update: UpdateFilter<I> | ReadonlyArray<Document>,
    options?: UpdateOptions
  ): Effect.Effect<UpdateResult<I>, MongoError.MongoError, R> =>
    Effect.promise(() =>
      collection.collection.updateMany(
        filter,
        Array.isArray(update) ? [...update] : update as UpdateFilter<Document>,
        options
      )
    ).pipe(Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "updateMany"))))
)

export const replaceOne: {
  <A extends Document, I extends Document>(
    filter: Filter<I>,
    replacement: A,
    options?: ReplaceOptions
  ): <R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<UpdateResult<I> | Document, MongoError.MongoError | ParseResult.ParseError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A,
    options?: ReplaceOptions
  ): Effect.Effect<UpdateResult<I> | Document, MongoError.MongoError | ParseResult.ParseError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    filter: Filter<I>,
    replacement: A,
    options?: ReplaceOptions
  ): Effect.Effect<
    UpdateResult<I> | Document,
    MongoError.MongoError | ParseResult.ParseError,
    R
  > =>
    F.pipe(
      collection.encode(replacement),
      Effect.flatMap((replacement) =>
        Effect.promise(() => collection.collection.replaceOne(filter, replacement, options))
      ),
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "replaceOne")))
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
      collection.encode(replacement),
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
        mongoErrorOrDie(errorSource(collection, "findOneAndReplace"))
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
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "rename")))
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
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "drop")))
    )
)

export const createIndexes: {
  (
    indexSpecs: ReadonlyArray<IndexDescription>,
    options?: CreateIndexesOptions
  ): <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<Array<string>, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    indexSpecs: ReadonlyArray<IndexDescription>,
    options?: CreateIndexesOptions
  ): Effect.Effect<Array<string>, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    indexSpecs: ReadonlyArray<IndexDescription>,
    options?: CreateIndexesOptions
  ): Effect.Effect<Array<string>, MongoError.MongoError, R> =>
    F.pipe(
      Effect.promise(() => collection.collection.createIndexes([...indexSpecs], options)),
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "createIndexes")))
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
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "createIndex")))
    )
)

export const dropIndex: {
  (indexName: string, options?: DropIndexesOptions): <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>
  ) => Effect.Effect<Document, MongoError.MongoError, R>
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    indexName: string,
    options?: DropIndexesOptions
  ): Effect.Effect<Document, MongoError.MongoError, R>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>,
    indexName: string,
    options?: DropIndexesOptions
  ): Effect.Effect<Document, MongoError.MongoError, R> =>
    F.pipe(
      Effect.promise(() => collection.collection.dropIndex(indexName, options)),
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "dropIndex")))
    )
)

export const aggregate: {
  <B extends Document, BI extends Document, BR>(
    schema: Schema.Schema<B, BI, BR>,
    pipeline: ReadonlyArray<Document>,
    options?: AggregateOptions
  ): <A extends Document, I extends Document, R>(
    collection: Collection<A, I, R>
  ) => AggregationCursor.AggregationCursor<B, BI, BR>
  <A extends Document, I extends Document, R, B extends Document, BI extends Document, BR>(
    collection: Collection<A, I, R>,
    schema: Schema.Schema<B, BI, BR>,
    pipeline: ReadonlyArray<Document>,
    options?: AggregateOptions
  ): AggregationCursor.AggregationCursor<B, BI, BR>
} = F.dual(
  (args) => isCollection(args[0]),
  <A extends Document, I extends Document, R, B extends Document, BI extends Document, BR>(
    collection: Collection<A, I, R>,
    schema: Schema.Schema<B, BI, BR>,
    pipeline: ReadonlyArray<Document>,
    options?: AggregateOptions
  ): AggregationCursor.AggregationCursor<B, BI, BR> =>
    new AggregationCursor.AggregationCursor<B, BI, BR>({
      cursor: collection.collection.aggregate([...pipeline], options),
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
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "estimatedDocumentCount")))
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
      Effect.catchAllDefect(mongoErrorOrDie(errorSource(collection, "countDocuments")))
    )
)

const isCollection = (x: unknown) => x instanceof Collection

const errorSource = <A extends Document, I extends Document = A, R = never>(
  collection: Collection<A, I, R>,
  functionName: string
) =>
  new MongoError.CollectionErrorSource({
    module: Collection.name,
    functionName,
    db: collection.collection.dbName,
    collection: collection.collection.collectionName
  })
