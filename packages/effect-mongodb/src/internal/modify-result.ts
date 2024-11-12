import type * as O from "effect/Option"
import type { ModifyResult as MongoModifyResult } from "mongodb"

export type ModifyResult<TSchema> = Omit<MongoModifyResult<TSchema>, "value"> & {
  value: O.Option<TSchema>
}
