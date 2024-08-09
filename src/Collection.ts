import type * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import type { Collection as MongoCollection } from "mongodb"

export class Collection<A, I = A, R = never> extends Data.TaggedClass("Collection")<{
  collection: MongoCollection
  schema: Schema.Schema<A, I, R>
}> {
}
