import * as Data from "effect/Data"
import type {
  CollectionInfo as MongoCollectionInfo,
  ListCollectionsCursor as MongoListCollectionsCursor
} from "mongodb"

export type NameOnlyCollectionInfo = Pick<MongoCollectionInfo, "name" | "type">
export type FullCollectionInfo = MongoCollectionInfo

type DefaultCollectionInfo = NameOnlyCollectionInfo | FullCollectionInfo

export class ListCollectionsCursor<
  T extends DefaultCollectionInfo = DefaultCollectionInfo
> extends Data.TaggedClass("ListCollectionsCursor")<{
  cursor: MongoListCollectionsCursor<T>
}> {}

export type NameOnlyListCollectionsCursor = ListCollectionsCursor<Pick<MongoCollectionInfo, "name" | "type">>

export type FullListCollectionsCursor = ListCollectionsCursor<MongoCollectionInfo>
