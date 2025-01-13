/**
 * @since 0.0.1
 */
import * as Data from "effect/Data"
import type { MongoError as MongoError_ } from "mongodb"

export class ClientErrorSource extends Data.TaggedClass("ClientErrorSource")<{
  module: string
  functionName: string
  hosts: string[]
}> {}

export class DbErrorSource extends Data.TaggedClass("DbErrorSource")<{
  module: string
  functionName: string
  db: string
}> {}

export class CollectionErrorSource extends Data.TaggedClass("CollectionErrorSource")<{
  module: string
  functionName: string
  db: string
  collection: string
}> {}

export type ErrorSource = ClientErrorSource | DbErrorSource | CollectionErrorSource

export class MongoError extends Data.TaggedError("MongoError")<{
  message: string
  cause: MongoError_
  source?: ErrorSource
}> {}
