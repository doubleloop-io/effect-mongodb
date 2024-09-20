/**
 * @since 0.0.1
 */
import type * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import * as F from "effect/Function"
import * as Stream from "effect/Stream"
import type { Document, FindCursor as MongoFindCursor, Sort, SortDirection } from "mongodb"
import * as FindCursor from "./FindCursor.js"
import * as MongoError from "./MongoError.js"

export class DocumentFindCursor extends Data.TaggedClass("DocumentFindCursor")<{
  cursor: MongoFindCursor<Document>
}> {
}

export const filter: {
  (
    filter: Document
  ): (cursor: DocumentFindCursor) => DocumentFindCursor
  (cursor: DocumentFindCursor, filter: Document): DocumentFindCursor
} = F.dual(
  2,
  (cursor: DocumentFindCursor, filter: Document): DocumentFindCursor =>
    new DocumentFindCursor({ cursor: cursor.cursor.filter(filter) })
)

export const project: {
  (
    value: Document
  ): (cursor: DocumentFindCursor) => DocumentFindCursor
  (cursor: DocumentFindCursor, value: Document): DocumentFindCursor
} = F.dual(
  2,
  (cursor: DocumentFindCursor, value: Document): DocumentFindCursor =>
    new DocumentFindCursor({ cursor: cursor.cursor.project(value) })
)

export const sort: {
  (
    sort: Sort | string,
    direction?: SortDirection
  ): (cursor: DocumentFindCursor) => DocumentFindCursor
  (cursor: DocumentFindCursor, sort: Sort | string, direction?: SortDirection): DocumentFindCursor
} = F.dual(
  (args) => isFindCursor(args[0]),
  (cursor: DocumentFindCursor, sort: Sort | string, direction?: SortDirection): DocumentFindCursor =>
    new DocumentFindCursor({ cursor: cursor.cursor.sort(sort, direction) })
)

export const limit: {
  (
    value: number
  ): (cursor: DocumentFindCursor) => DocumentFindCursor
  (cursor: DocumentFindCursor, value: number): DocumentFindCursor
} = F.dual(
  2,
  (cursor: DocumentFindCursor, value: number): DocumentFindCursor =>
    new DocumentFindCursor({ cursor: cursor.cursor.limit(value) })
)

export const toArray = (cursor: DocumentFindCursor): Effect.Effect<ReadonlyArray<Document>, MongoError.MongoError> =>
  F.pipe(
    Effect.promise(() => cursor.cursor.toArray()),
    Effect.catchAll(MongoError.mongoErrorDie<ReadonlyArray<Document>>("toArray error"))
  )

export const toStream = (
  cursor: DocumentFindCursor
): Stream.Stream<Document, MongoError.MongoError> =>
  F.pipe(
    Stream.fromAsyncIterable(cursor.cursor, F.identity),
    Stream.catchAll(MongoError.mongoErrorStream<Document>("Unable to read from mongodb cursor"))
  )

export const typed: {
  <A, I = A, R = never>(
    schema: Schema.Schema<A, I, R>
  ): (cursor: DocumentFindCursor) => FindCursor.FindCursor<A, I, R>
  <A, I = A, R = never>(
    cursor: DocumentFindCursor,
    schema: Schema.Schema<A, I, R>
  ): FindCursor.FindCursor<A, I, R>
} = F.dual(2, <A, I = A, R = never>(
  cursor: DocumentFindCursor,
  schema: Schema.Schema<A, I, R>
): FindCursor.FindCursor<A, I, R> => new FindCursor.FindCursor<A, I, R>({ cursor: cursor.cursor, schema }))

const isFindCursor = (x: unknown) => x instanceof DocumentFindCursor
